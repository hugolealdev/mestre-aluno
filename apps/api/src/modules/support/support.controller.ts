import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { ReplyTicketDto } from './dto/reply-ticket.dto.js';
import { SupportService } from './support.service.js';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  async list(@CurrentUser() user: JwtPayload) {
    return this.supportService.listTickets(user.sub, user.role);
  }

  @Post('tickets')
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user.sub, dto);
  }

  @Post('tickets/:ticketId/reply')
  async reply(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplyTicketDto
  ) {
    return this.supportService.replyToTicket(user.sub, user.role, ticketId, dto);
  }
}

