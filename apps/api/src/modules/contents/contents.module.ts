import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller.js';
import { ContentsService } from './contents.service.js';

@Module({
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService]
})
export class ContentsModule {}
