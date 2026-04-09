import { IsOptional, IsString } from 'class-validator';

export class CancelLessonDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

