import { Injectable } from '@nestjs/common';
import { Role } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { userSelect } from '../users/users.service.js';
import { DashboardPeriodDto } from './dto/dashboard-period.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        ...userSelect,
        cpf: true,
        headline: true,
        bio: true,
        postalCode: true,
        addressLine1: true,
        addressLine2: true
      }
    });
  }

  async updateMe(userId: string, role: Role, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        cpf: dto.cpf,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        headline: dto.headline,
        bio: dto.bio,
        teacherProfile:
          role === Role.TEACHER
            ? {
                upsert: {
                  update: {
                    specialties: dto.specialties
                  },
                  create: {
                    publicSlug: `${userId}-${Date.now()}`,
                    specialties: dto.specialties ?? []
                  }
                }
              }
            : undefined,
        studentProfile:
          role === Role.STUDENT
            ? {
                upsert: {
                  update: {
                    educationLevel: dto.educationLevel,
                    schoolName: dto.schoolName,
                    studyGoal: dto.studyGoal,
                    futureInterests: dto.futureInterests
                  },
                  create: {
                    educationLevel: dto.educationLevel,
                    schoolName: dto.schoolName,
                    studyGoal: dto.studyGoal,
                    futureInterests: dto.futureInterests
                  }
                }
              }
            : undefined
      },
      select: {
        ...userSelect,
        cpf: true,
        headline: true,
        bio: true,
        postalCode: true,
        addressLine1: true,
        addressLine2: true
      }
    });
  }

  async dashboard(userId: string, role: Role, period?: DashboardPeriodDto) {
    const range = this.buildDateRange(period);

    if (role === Role.TEACHER) {
      const [students, lessons, contents, tasks] = await Promise.all([
        this.prisma.teacherStudentLink.count({
          where: { teacherId: userId, createdAt: range }
        }),
        this.prisma.lesson.findMany({
          where: { teacherId: userId, startAt: range },
          select: { status: true, priceAmount: true }
        }),
        this.prisma.content.count({ where: { teacherId: userId, createdAt: range } }),
        this.prisma.task.count({ where: { teacherId: userId, createdAt: range } })
      ]);

      const totalRecebimentos = lessons
        .filter((lesson) => lesson.status !== 'CANCELED')
        .reduce((sum, lesson) => sum + Number(lesson.priceAmount), 0);

      return {
        role,
        period: this.describePeriod(range),
        students,
        totalLessons: lessons.length,
        scheduledLessons: lessons.filter((lesson) => lesson.status === 'SCHEDULED').length,
        inProgressLessons: lessons.filter((lesson) => lesson.status === 'IN_PROGRESS').length,
        completedLessons: lessons.filter((lesson) => lesson.status === 'COMPLETED').length,
        totalRecebimentos,
        publishedContents: contents,
        tasks
      };
    }

    if (role === Role.STUDENT) {
      const [lessons, purchases, profile] = await Promise.all([
        this.prisma.lesson.findMany({
          where: { studentId: userId, startAt: range },
          select: { status: true }
        }),
        this.prisma.contentPurchase.count({
          where: { studentId: userId, paymentStatus: 'SUCCEEDED', createdAt: range }
        }),
        this.prisma.studentProfile.findUnique({
          where: { userId },
          select: { notesAverage: true }
        })
      ]);

      return {
        role,
        period: this.describePeriod(range),
        completedLessons: lessons.filter((lesson) => lesson.status === 'COMPLETED').length,
        scheduledLessons: lessons.filter((lesson) => lesson.status === 'SCHEDULED').length,
        canceledLessons: lessons.filter((lesson) => lesson.status === 'CANCELED').length,
        averageScore: Number(profile?.notesAverage ?? 0),
        libraryItems: purchases
      };
    }

    return {
      role,
      period: this.describePeriod(range)
    };
  }

  private buildDateRange(period?: DashboardPeriodDto) {
    const startDate = period?.startDate ? new Date(period.startDate) : null;
    const endDate = period?.endDate ? new Date(period.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    if (!startDate && !endDate) {
      return undefined;
    }

    return {
      gte: startDate ?? undefined,
      lte: endDate ?? undefined
    };
  }

  private describePeriod(range?: { gte?: Date; lte?: Date }) {
    return {
      startDate: range?.gte?.toISOString() ?? null,
      endDate: range?.lte?.toISOString() ?? null,
      label:
        range?.gte || range?.lte
          ? `${range?.gte ? range.gte.toLocaleDateString('pt-BR') : 'Início aberto'} até ${
              range?.lte ? range.lte.toLocaleDateString('pt-BR') : 'Hoje'
            }`
          : 'Todo o período'
    };
  }
}
