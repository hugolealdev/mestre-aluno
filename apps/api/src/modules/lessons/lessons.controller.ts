import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { CancelLessonDto } from './dto/cancel-lesson.dto.js';
import { CreateLessonCheckoutDto } from './dto/create-lesson-checkout.dto.js';
import { RequestRescheduleDto } from './dto/request-reschedule.dto.js';
import { RespondRescheduleDto } from './dto/respond-reschedule.dto.js';
import { LessonsService } from './lessons.service.js';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('me')
  async myLessons(@CurrentUser() user: JwtPayload) {
    return this.lessonsService.listMine(user.sub, user.role);
  }

  @Post('checkout')
  async createCheckout(@CurrentUser() user: JwtPayload, @Body() dto: CreateLessonCheckoutDto) {
    return this.lessonsService.createCheckout(user.sub, dto, process.env.APP_URL ?? '');
  }

  @Post(':lessonId/reschedule')
  async requestReschedule(
    @CurrentUser() user: JwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: RequestRescheduleDto
  ) {
    return this.lessonsService.requestReschedule(user.sub, user.role, lessonId, dto);
  }

  @Post('reschedules/:requestId/respond')
  async respondReschedule(
    @CurrentUser() user: JwtPayload,
    @Param('requestId') requestId: string,
    @Body() dto: RespondRescheduleDto
  ) {
    return this.lessonsService.respondReschedule(user.sub, user.role, requestId, dto);
  }

  @Post(':lessonId/cancel')
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: CancelLessonDto
  ) {
    return this.lessonsService.cancelLesson(user.sub, user.role, lessonId, dto);
  }
}
