import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../../../generated/prisma/index.js';

export class ReplyTicketDto {
  @IsString()
  body!: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}

