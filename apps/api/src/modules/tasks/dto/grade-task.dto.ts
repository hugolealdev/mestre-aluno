import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GradeTaskDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

