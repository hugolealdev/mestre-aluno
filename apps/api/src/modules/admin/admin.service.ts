import { Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  Role,
  SubscriptionStatus,
  UserStatus,
  VerificationStatus
} from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardPeriodDto } from './dto/dashboard-period.dto.js';
import { UpdateModuleToggleDto } from './dto/update-module-toggle.dto.js';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(period?: DashboardPeriodDto) {
    const range = this.buildDateRange(period);
    const [
      totalTeachers,
      totalStudents,
      totalSubscriptions,
      blockedUsers,
      pendingVerifications,
      openTickets,
      payments
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.TEACHER, createdAt: range } }),
      this.prisma.user.count({ where: { role: Role.STUDENT, createdAt: range } }),
      this.prisma.subscription.count({ where: { createdAt: range } }),
      this.prisma.user.count({ where: { status: UserStatus.BLOCKED, updatedAt: range } }),
      this.prisma.verificationRequest.count({
        where: { status: VerificationStatus.PENDING, createdAt: range }
      }),
      this.prisma.supportTicket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, createdAt: range }
      }),
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.SUCCEEDED, createdAt: range },
        select: { type: true, amount: true, createdAt: true }
      })
    ]);

    const totals = payments.reduce(
      (accumulator, payment) => {
        const amount = Number(payment.amount);
        accumulator.receitaBruta += amount;

        if (payment.type === 'SUBSCRIPTION') {
          accumulator.assinaturas += amount;
        }
        if (payment.type === 'LESSON') {
          accumulator.aulas += amount;
          accumulator.repasseEstimado += amount * 0.85;
        }
        if (payment.type === 'CONTENT') {
          accumulator.conteudos += amount;
          accumulator.repasseEstimado += amount * 0.85;
        }
        if (payment.type === 'VERIFICATION') {
          accumulator.verificacoes += amount;
        }

        return accumulator;
      },
      {
        receitaBruta: 0,
        repasseEstimado: 0,
        assinaturas: 0,
        aulas: 0,
        conteudos: 0,
        verificacoes: 0
      }
    );

    return {
      totalTeachers,
      totalStudents,
      totalSubscriptions,
      blockedUsers,
      pendingVerifications,
      openTickets,
      period: this.describePeriod(range),
      receitaBruta: totals.receitaBruta,
      repasseEstimado: totals.repasseEstimado,
      receitaLiquida: totals.receitaBruta - totals.repasseEstimado,
      receitaPorTipo: {
        assinaturas: totals.assinaturas,
        aulas: totals.aulas,
        conteudos: totals.conteudos,
        verificacoes: totals.verificacoes
      }
    };
  }

  async financialSummary(period?: DashboardPeriodDto) {
    const range = this.buildDateRange(period);
    const successfulPayments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCEEDED, createdAt: range },
      select: {
        type: true,
        amount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totals = successfulPayments.reduce(
      (accumulator, payment) => {
        const amount = Number(payment.amount);
        accumulator.total += amount;
        accumulator.byType[payment.type] = (accumulator.byType[payment.type] ?? 0) + amount;
        return accumulator;
      },
      {
        total: 0,
        byType: {
          SUBSCRIPTION: 0,
          LESSON: 0,
          CONTENT: 0,
          VERIFICATION: 0
        } as Record<string, number>
      }
    );

    return {
      period: this.describePeriod(range),
      total: totals.total,
      subscriptions: totals.byType.SUBSCRIPTION,
      lessons: totals.byType.LESSON,
      contents: totals.byType.CONTENT,
      verifications: totals.byType.VERIFICATION,
      recentTransactions: successfulPayments.slice(0, 10)
    };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        verificationStatus: true,
        isVerified: true,
        city: true,
        createdAt: true,
        subscriptions: {
          where: {
            status: {
              in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE]
            }
          },
          select: {
            tier: true,
            status: true,
            role: true
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (dto.status === UserStatus.BLOCKED) {
      await this.prisma.subscription.updateMany({
        where: { userId },
        data: {
          status: SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: true
        }
      });
    }

    return user;
  }

  async listModuleToggles() {
    const defaults = [
      { key: 'teacher-agenda', label: 'Agenda do professor' },
      { key: 'student-library', label: 'Biblioteca do aluno' },
      { key: 'support-center', label: 'Suporte' },
      { key: 'verification-flow', label: 'Verificação' },
      { key: 'admin-finance', label: 'Financeiro administrativo' }
    ];

    await Promise.all(
      defaults.map((item) =>
        this.prisma.moduleToggle.upsert({
          where: { key: item.key },
          update: {},
          create: {
            key: item.key,
            label: item.label
          }
        })
      )
    );

    return this.prisma.moduleToggle.findMany({
      orderBy: { label: 'asc' }
    });
  }

  async updateModuleToggle(toggleId: string, dto: UpdateModuleToggleDto) {
    return this.prisma.moduleToggle.update({
      where: { id: toggleId },
      data: { enabled: dto.enabled }
    });
  }

  async getPlatformSettings() {
    const settings = await this.prisma.platformSetting.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (settings) {
      return settings;
    }

    return this.prisma.platformSetting.create({
      data: {}
    });
  }

  async updatePlatformSettings(dto: UpdatePlatformSettingsDto) {
    const settings = await this.getPlatformSettings();

    return this.prisma.platformSetting.update({
      where: { id: settings.id },
      data: dto
    });
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
