import { IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(160)
  subject!: string;

  @IsString()
  description!: string;
}

