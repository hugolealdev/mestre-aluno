import { Module } from '@nestjs/common';
import { ContentsModule } from '../contents/contents.module.js';
import { LessonsModule } from '../lessons/lessons.module.js';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';

@Module({
  imports: [ContentsModule, LessonsModule],
  controllers: [BillingController],
  providers: [BillingService]
})
export class BillingModule {}
