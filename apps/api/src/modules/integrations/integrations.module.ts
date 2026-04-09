import { Global, Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service.js';
import { StripeService } from './stripe.service.js';
import { SupabaseAdminService } from './supabase-admin.service.js';

@Global()
@Module({
  providers: [StripeService, SupabaseAdminService, GoogleCalendarService],
  exports: [StripeService, SupabaseAdminService, GoogleCalendarService]
})
export class IntegrationsModule {}
