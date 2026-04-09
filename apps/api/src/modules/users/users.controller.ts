import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (user.sub !== id && user.role !== 'ADMIN') {
      return this.usersService.findById(user.sub);
    }

    return this.usersService.findById(id);
  }
}

