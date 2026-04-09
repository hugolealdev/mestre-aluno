import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '../config/env.schema.js';
import { AdminModule } from './admin/admin.module.js';
import { AvailabilityModule } from './availability/availability.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BillingModule } from './billing/billing.module.js';
import { ContentsModule } from './contents/contents.module.js';
import { DiscoveryModule } from './discovery/discovery.module.js';
import { HealthModule } from './health/health.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { LessonsModule } from './lessons/lessons.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SupportModule } from './support/support.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { UsersModule } from './users/users.module.js';
import { VerificationsModule } from './verifications/verifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envSchema
    }),
    PrismaModule,
    IntegrationsModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AdminModule,
    ContentsModule,
    DiscoveryModule,
    LessonsModule,
    BillingModule,
    ProfileModule,
    AvailabilityModule,
    SupportModule,
    TasksModule,
    VerificationsModule
  ]
})
export class AppModule {}
