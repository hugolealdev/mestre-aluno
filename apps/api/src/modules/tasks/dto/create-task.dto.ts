import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateTaskQuestionDto {
  @IsString()
  prompt!: string;

  @IsString()
  inputType!: string;

  @IsInt()
  sortOrder!: number;
}

export class CreateTaskDto {
  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskQuestionDto)
  questions!: CreateTaskQuestionDto[];
}

