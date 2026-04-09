import { IsDateString, IsOptional } from 'class-validator';

export class DashboardPeriodDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
