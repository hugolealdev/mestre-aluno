import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/index.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AdminService } from './admin.service.js';
import { DashboardPeriodDto } from './dto/dashboard-period.dto.js';
import { UpdateModuleToggleDto } from './dto/update-module-toggle.dto.js';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async dashboard(@Query() query: DashboardPeriodDto) {
    return this.adminService.dashboard(query);
  }

  @Get('modules')
  async modules() {
    return this.adminService.listModuleToggles();
  }

  @Get('finance')
  async finance(@Query() query: DashboardPeriodDto) {
    return this.adminService.financialSummary(query);
  }

  @Get('users')
  async users() {
    return this.adminService.listUsers();
  }

  @Get('settings')
  async settings() {
    return this.adminService.getPlatformSettings();
  }

  @Patch('modules/:toggleId')
  async updateModule(
    @Param('toggleId') toggleId: string,
    @Body() dto: UpdateModuleToggleDto
  ) {
    return this.adminService.updateModuleToggle(toggleId, dto);
  }

  @Patch('users/:userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto
  ) {
    return this.adminService.updateUserStatus(userId, dto);
  }

  @Patch('settings')
  async updateSettings(@Body() dto: UpdatePlatformSettingsDto) {
    return this.adminService.updatePlatformSettings(dto);
  }
}
