import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IntegrationsController } from './integrations.controller.js';
import { GoogleCalendarService } from './google-calendar.service.js';
import { IntegrationsService } from './integrations.service.js';
import { StripeService } from './stripe.service.js';
import { SupabaseAdminService } from './supabase-admin.service.js';

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [IntegrationsController],
  providers: [
    StripeService,
    SupabaseAdminService,
    GoogleCalendarService,
    IntegrationsService
  ],
  exports: [StripeService, SupabaseAdminService, GoogleCalendarService, IntegrationsService]
})
export class IntegrationsModule {}
