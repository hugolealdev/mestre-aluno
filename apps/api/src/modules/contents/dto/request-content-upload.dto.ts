import { IsString } from 'class-validator';

export class RequestContentUploadDto {
  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;
}

