import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { LessonStatus, PaymentStatus, PaymentType, Role } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StripeService } from '../integrations/stripe.service.js';
import { GoogleCalendarService } from '../integrations/google-calendar.service.js';
import { CancelLessonDto } from './dto/cancel-lesson.dto.js';
import { CreateLessonCheckoutDto } from './dto/create-lesson-checkout.dto.js';
import { RequestRescheduleDto } from './dto/request-reschedule.dto.js';
import { RespondRescheduleDto } from './dto/respond-reschedule.dto.js';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly googleCalendarService: GoogleCalendarService
  ) {}

  async createCheckout(studentId: string, dto: CreateLessonCheckoutDto, appUrl: string) {
    const [student, teacher] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: studentId } }),
      this.prisma.user.findUnique({
        where: { id: dto.teacherId },
        include: { teacherProfile: true }
      })
    ]);

    if (!student || student.role !== Role.STUDENT) {
      throw new ForbiddenException('Apenas alunos podem agendar aulas.');
    }

    if (!teacher || teacher.role !== Role.TEACHER || !teacher.teacherProfile?.publicBasePrice) {
      throw new NotFoundException('Professor indisponível para agendamento.');
    }

    if (studentId === teacher.id) {
      throw new BadRequestException('Aluno não pode agendar aula consigo mesmo.');
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (!(startAt < endAt)) {
      throw new BadRequestException('Intervalo da aula inválido.');
    }

    const hasConflict = await this.prisma.lesson.findFirst({
      where: {
        teacherId: teacher.id,
        status: {
          in: [LessonStatus.SCHEDULED, LessonStatus.IN_PROGRESS, LessonStatus.RESCHEDULE_PENDING]
        },
        OR: [
          {
            startAt: { lt: endAt },
            endAt: { gt: startAt }
          }
        ]
      }
    });

    if (hasConflict) {
      throw new BadRequestException('Horário indisponível.');
    }

    const amount = Number(teacher.teacherProfile.publicBasePrice);
    const session = await this.stripeService.client.checkout.sessions.create({
      mode: 'payment',
      success_url: `${appUrl}/painel?lesson=success`,
      cancel_url: `${appUrl}/painel?lesson=cancel`,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Aula com ${teacher.fullName}`,
              description: dto.subject
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        studentId,
        teacherId: teacher.id,
        subject: dto.subject,
        topic: dto.topic,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        checkoutType: 'lesson_purchase'
      }
    });

    const lesson = await this.prisma.lesson.create({
      data: {
        teacherId: teacher.id,
        studentId,
        subject: dto.subject,
        topic: dto.topic,
        startAt,
        endAt,
        status: LessonStatus.SCHEDULED,
        stripeCheckoutId: session.id,
        paymentStatus: PaymentStatus.PENDING,
        priceAmount: amount,
        refundEligible: this.isRefundEligible(startAt)
      }
    });

    await this.prisma.payment.create({
      data: {
        userId: studentId,
        lessonId: lesson.id,
        stripeCheckoutId: session.id,
        type: PaymentType.LESSON,
        status: PaymentStatus.PENDING,
        amount: amount,
        metadataJson: {
          teacherId: teacher.id,
          subject: dto.subject,
          topic: dto.topic
        }
      }
    });

    return { url: session.url, sessionId: session.id };
  }

  async fulfillLesson(sessionId: string, paymentIntentId: string | null, amountTotal: number | null) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { stripeCheckoutId: sessionId },
      include: {
        teacher: true,
        student: true
      }
    });

    if (!lesson) {
      return;
    }

    const calendarEvent = await this.googleCalendarService.createLessonEvent(
      {
        summary: `Aula: ${lesson.subject}`,
        description: lesson.topic ?? undefined,
        startAt: lesson.startAt,
        endAt: lesson.endAt,
        attendeeEmails: [lesson.teacher.email, lesson.student.email]
      },
      lesson.teacher.googleRefreshToken ?? undefined
    );

    await this.prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        googleCalendarEventId: calendarEvent?.eventId ?? null,
        googleMeetUrl: calendarEvent?.meetUrl ?? null
      }
    });

    await this.prisma.payment.updateMany({
      where: { lessonId: lesson.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: paymentIntentId,
        amount: amountTotal ? amountTotal / 100 : lesson.priceAmount
      }
    });

    await this.prisma.teacherStudentLink.upsert({
      where: {
        teacherId_studentId: {
          teacherId: lesson.teacherId,
          studentId: lesson.studentId
        }
      },
      update: {},
      create: {
        teacherId: lesson.teacherId,
        studentId: lesson.studentId
      }
    });
  }

  async listMine(userId: string, role: Role) {
    const lessons = await this.prisma.lesson.findMany({
      where:
        role === Role.TEACHER
          ? { teacherId: userId }
          : role === Role.STUDENT
            ? { studentId: userId }
            : undefined,
      include: {
        teacher: {
          select: { id: true, fullName: true, city: true, isVerified: true }
        },
        student: {
          select: { id: true, fullName: true, city: true, isVerified: true }
        },
        rescheduleRequests: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { startAt: 'desc' }
    });

    return lessons.map((lesson) => ({
      ...lesson,
      googleMeetUrl: this.canExposeMeetLink(lesson.startAt, lesson.endAt, lesson.status)
        ? lesson.googleMeetUrl
        : null,
      meetJoinAvailable: this.canExposeMeetLink(lesson.startAt, lesson.endAt, lesson.status)
    }));
  }

  async requestReschedule(userId: string, role: Role, lessonId: string, dto: RequestRescheduleDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada.');
    }

    const canManage =
      (role === Role.TEACHER && lesson.teacherId === userId) ||
      (role === Role.STUDENT && lesson.studentId === userId);

    if (!canManage) {
      throw new ForbiddenException('Aula não pertence ao usuário autenticado.');
    }

    const newStartAt = new Date(dto.newStartAt);
    const newEndAt = new Date(dto.newEndAt);

    if (!(newStartAt < newEndAt)) {
      throw new BadRequestException('Novo intervalo inválido.');
    }

    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: LessonStatus.RESCHEDULE_PENDING
      }
    });

    return this.prisma.lessonReschedule.create({
      data: {
        lessonId,
        requestedById: userId,
        oldStartAt: lesson.startAt,
        oldEndAt: lesson.endAt,
        newStartAt,
        newEndAt,
        reason: dto.reason
      }
    });
  }

  async respondReschedule(userId: string, role: Role, requestId: string, dto: RespondRescheduleDto) {
    const request = await this.prisma.lessonReschedule.findUnique({
      where: { id: requestId },
      include: {
        lesson: {
          include: {
            teacher: true,
            student: true
          }
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Solicitação de reagendamento não encontrada.');
    }

    const isCounterpart =
      (role === Role.TEACHER && request.lesson.teacherId === userId && request.requestedById !== userId) ||
      (role === Role.STUDENT && request.lesson.studentId === userId && request.requestedById !== userId);

    if (!isCounterpart) {
      throw new ForbiddenException('Somente a outra parte pode responder ao reagendamento.');
    }

    if (dto.approve) {
      const calendarEvent = request.lesson.googleCalendarEventId
        ? await this.googleCalendarService.updateLessonEvent(
            {
              eventId: request.lesson.googleCalendarEventId,
              summary: `Aula: ${request.lesson.subject}`,
              description: request.lesson.topic ?? undefined,
              startAt: request.newStartAt,
              endAt: request.newEndAt,
              attendeeEmails: [request.lesson.teacher.email, request.lesson.student.email]
            },
            request.lesson.teacher.googleRefreshToken ?? undefined
          )
        : null;

      await this.prisma.lesson.update({
        where: { id: request.lessonId },
        data: {
          startAt: request.newStartAt,
          endAt: request.newEndAt,
          status: LessonStatus.SCHEDULED,
          googleCalendarEventId: calendarEvent?.eventId ?? request.lesson.googleCalendarEventId,
          googleMeetUrl: calendarEvent?.meetUrl ?? request.lesson.googleMeetUrl
        }
      });

      return this.prisma.lessonReschedule.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });
    }

    await this.prisma.lesson.update({
      where: { id: request.lessonId },
      data: {
        status: LessonStatus.CANCELED
      }
    });

    return this.prisma.lessonReschedule.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });
  }

  async cancelLesson(userId: string, role: Role, lessonId: string, dto: CancelLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        teacher: true,
        student: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada.');
    }

    const canCancel =
      (role === Role.TEACHER && lesson.teacherId === userId) ||
      (role === Role.STUDENT && lesson.studentId === userId);

    if (!canCancel) {
      throw new ForbiddenException('Aula não pertence ao usuário autenticado.');
    }

    const refundEligible = this.isRefundEligible(lesson.startAt);
    const payment = lesson.payments[0] ?? null;

    if (refundEligible && payment?.status !== PaymentStatus.REFUNDED) {
      if (!payment?.stripePaymentIntentId) {
        throw new BadRequestException('Pagamento da aula ainda não está apto para estorno automático.');
      }

      await this.stripeService.client.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          lessonId: lesson.id,
          canceledBy: userId
        }
      });
    }

    if (lesson.googleCalendarEventId) {
      await this.googleCalendarService.cancelLessonEvent(
        lesson.googleCalendarEventId,
        lesson.teacher.googleRefreshToken ?? undefined
      );
    }

    await this.prisma.payment.updateMany({
      where: { lessonId: lesson.id },
      data: {
        status:
          refundEligible && payment?.stripePaymentIntentId
            ? PaymentStatus.REFUNDED
            : payment?.status ?? PaymentStatus.SUCCEEDED,
        metadataJson: {
          reason: dto.reason ?? null,
          refundEligible,
          canceledBy: userId,
          canceledAt: new Date().toISOString()
        }
      }
    });

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: LessonStatus.CANCELED,
        refundEligible
      }
    });
  }

  private isRefundEligible(startAt: Date) {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return startAt.getTime() - Date.now() >= sevenDaysMs;
  }

  private canExposeMeetLink(startAt: Date, endAt: Date, status: LessonStatus) {
    if (!['SCHEDULED', 'IN_PROGRESS'].includes(status)) {
      return false;
    }

    const now = Date.now();
    const joinWindowStart = startAt.getTime() - 5 * 60 * 1000;
    const joinWindowEnd = endAt.getTime() + 30 * 60 * 1000;

    return now >= joinWindowStart && now <= joinWindowEnd;
  }
}
