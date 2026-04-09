import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Role, TicketStatus } from '../../generated/prisma/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { ReplyTicketDto } from './dto/reply-ticket.dto.js';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        ownerId: userId,
        subject: dto.subject,
        description: dto.description,
        messages: {
          create: {
            senderId: userId,
            body: dto.description
          }
        }
      },
      include: {
        messages: true
      }
    });
  }

  async listTickets(userId: string, role: Role) {
    return this.prisma.supportTicket.findMany({
      where: role === Role.ADMIN ? undefined : { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async replyToTicket(userId: string, role: Role, ticketId: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado.');
    }

    if (role !== Role.ADMIN && ticket.ownerId !== userId) {
      throw new ForbiddenException('Ticket não pertence ao usuário autenticado.');
    }

    const nextStatus =
      dto.status ??
      (role === Role.ADMIN ? TicketStatus.ANSWERED : TicketStatus.OPEN);

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: nextStatus,
        messages: {
          create: {
            senderId: userId,
            body: dto.body
          }
        }
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
}

