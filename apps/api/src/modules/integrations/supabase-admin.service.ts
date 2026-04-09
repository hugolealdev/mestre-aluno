import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAdminService {
  readonly client: SupabaseClient;
  readonly privateBucket: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRole = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !serviceRole) {
      throw new InternalServerErrorException('Credenciais do Supabase não configuradas.');
    }

    this.privateBucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET_PRIVATE') ?? 'private-assets';

    this.client = createClient(url, serviceRole, {
      auth: {
        persistSession: false
      }
    });
  }

  async createSignedDownloadUrl(path: string, expiresInSeconds = 60) {
    const { data, error } = await this.client.storage
      .from(this.privateBucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data.signedUrl;
  }

  async createSignedUploadUrl(path: string) {
    const { data, error } = await this.client.storage
      .from(this.privateBucket)
      .createSignedUploadUrl(path);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
