import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/index.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto.js';
import { RequestVerificationUploadDto } from './dto/request-verification-upload.dto.js';
import { ReviewVerificationDto } from './dto/review-verification.dto.js';
import { VerificationsService } from './verifications.service.js';

@ApiTags('verifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('verifications')
export class VerificationsController {
  constructor(private readonly verificationsService: VerificationsService) {}

  @Post('upload-url/document')
  async uploadDocument(@CurrentUser() user: JwtPayload, @Body() dto: RequestVerificationUploadDto) {
    return this.verificationsService.requestUpload(user.sub, dto, 'document');
  }

  @Post('upload-url/selfie')
  async uploadSelfie(@CurrentUser() user: JwtPayload, @Body() dto: RequestVerificationUploadDto) {
    return this.verificationsService.requestUpload(user.sub, dto, 'selfie');
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVerificationRequestDto) {
    return this.verificationsService.createRequest(user.sub, dto);
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload) {
    return this.verificationsService.myRequests(user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  async adminList() {
    return this.verificationsService.adminList();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/:requestId/approve')
  async approve(@Param('requestId') requestId: string) {
    return this.verificationsService.approve(requestId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/:requestId/reject')
  async reject(@Param('requestId') requestId: string, @Body() dto: ReviewVerificationDto) {
    return this.verificationsService.reject(requestId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/:requestId/file/:kind')
  async adminFile(
    @Param('requestId') requestId: string,
    @Param('kind') kind: 'document' | 'selfie'
  ) {
    return this.verificationsService.getAdminFileUrl(requestId, kind);
  }
}

