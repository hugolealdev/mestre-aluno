import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubmitTaskAnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  answerText!: string;
}

export class SubmitTaskDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitTaskAnswerDto)
  answers!: SubmitTaskAnswerDto[];
}

