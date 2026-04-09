import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ContentStatus } from '../../../generated/prisma/index.js';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  preview?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAmount?: number;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

