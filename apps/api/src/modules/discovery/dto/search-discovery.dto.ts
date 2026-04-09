import { IsOptional, IsString } from 'class-validator';

export class SearchDiscoveryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

