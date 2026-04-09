import { IsString } from 'class-validator';

export class RequestVerificationUploadDto {
  @IsString()
  fileName!: string;
}

