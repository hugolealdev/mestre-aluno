import { IsDateString, IsString } from 'class-validator';

export class CreateLessonCheckoutDto {
  @IsString()
  teacherId!: string;

  @IsString()
  subject!: string;

  @IsString()
  topic!: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;
}

