import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateContentDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  preview!: string;

  @IsNumber()
  @Min(0)
  priceAmount!: number;

  @IsString()
  filePath!: string;

  @IsOptional()
  @IsString()
  fileMimeType?: string;
}

