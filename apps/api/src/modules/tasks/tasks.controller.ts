import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { GradeTaskDto } from './dto/grade-task.dto.js';
import { SubmitTaskDto } from './dto/submit-task.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload) {
    return this.tasksService.listForUser(user.sub, user.role);
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.sub, user.role, dto);
  }

  @Post(':taskId/submit')
  async submit(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Body() dto: SubmitTaskDto
  ) {
    return this.tasksService.submit(user.sub, user.role, taskId, dto);
  }

  @Post(':taskId/grade')
  async grade(
    @CurrentUser() user: JwtPayload,
    @Param('taskId') taskId: string,
    @Body() dto: GradeTaskDto
  ) {
    return this.tasksService.grade(user.sub, user.role, taskId, dto);
  }
}

