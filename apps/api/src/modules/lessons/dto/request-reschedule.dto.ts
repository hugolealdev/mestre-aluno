import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestRescheduleDto {
  @IsDateString()
  newStartAt!: string;

  @IsDateString()
  newEndAt!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

