import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  platformName?: string;

  @IsOptional()
  @IsEmail()
  officialEmail?: string;

  @IsOptional()
  @IsString()
  logoPath?: string;

  @IsOptional()
  @IsString()
  iconPath?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  legalDocument?: string;
}

