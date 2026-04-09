import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BillingCheckoutType {
  STUDENT_SUBSCRIPTION = 'STUDENT_SUBSCRIPTION',
  TEACHER_SUBSCRIPTION = 'TEACHER_SUBSCRIPTION',
  VERIFICATION = 'VERIFICATION'
}

export class CreateCheckoutSessionDto {
  @IsEnum(BillingCheckoutType)
  type!: BillingCheckoutType;

  @IsOptional()
  @IsString()
  successPath?: string;

  @IsOptional()
  @IsString()
  cancelPath?: string;
}

