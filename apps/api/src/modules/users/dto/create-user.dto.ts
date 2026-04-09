import { Role } from '../../../generated/prisma/index.js';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsString()
  phone?: string;
}
