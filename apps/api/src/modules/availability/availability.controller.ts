import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/index.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { AvailabilityService } from './availability.service.js';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto.js';

@ApiTags('availability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    return this.availabilityService.listTeacherAvailability(user.sub);
  }

  @Post('me')
  async create(@CurrentUser() user: JwtPayload, @Body() dto: UpsertAvailabilityDto) {
    return this.availabilityService.createAvailability(user.sub, dto);
  }

  @Delete('me/:availabilityId')
  async remove(@CurrentUser() user: JwtPayload, @Param('availabilityId') availabilityId: string) {
    return this.availabilityService.deleteAvailability(user.sub, availabilityId);
  }
}
