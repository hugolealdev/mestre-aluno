import { IsString } from 'class-validator';

export class CreateVerificationRequestDto {
  @IsString()
  documentPath!: string;

  @IsString()
  selfieDocumentPath!: string;
}

