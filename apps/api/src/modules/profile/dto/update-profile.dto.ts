import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  studyGoal?: string;

  @IsOptional()
  @IsString()
  futureInterests?: string;
}

