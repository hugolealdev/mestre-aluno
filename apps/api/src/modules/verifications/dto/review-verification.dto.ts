import { IsOptional, IsString } from 'class-validator';

export class ReviewVerificationDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

