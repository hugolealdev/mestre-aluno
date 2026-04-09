import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { DashboardPeriodDto } from './dto/dashboard-period.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfileService } from './profile.service.js';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    return this.profileService.getMe(user.sub);
  }

  @Get('me/dashboard')
  async dashboard(@CurrentUser() user: JwtPayload, @Query() query: DashboardPeriodDto) {
    return this.profileService.dashboard(user.sub, user.role, query);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateMe(user.sub, user.role, dto);
  }
}
