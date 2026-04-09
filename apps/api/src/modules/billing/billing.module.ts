import { Module } from '@nestjs/common';
import { ContentsModule } from '../contents/contents.module.js';
import { LessonsModule } from '../lessons/lessons.module.js';
import { UsersModule } from '../users/users.module.js';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';

@Module({
  imports: [ContentsModule, LessonsModule, UsersModule],
  controllers: [BillingController],
  providers: [BillingService]
})
export class BillingModule {}
