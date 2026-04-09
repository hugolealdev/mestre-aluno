import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';
import { ContentsService } from './contents.service.js';
import { CreateContentDto } from './dto/create-content.dto.js';
import { RequestContentUploadDto } from './dto/request-content-upload.dto.js';
import { UpdateContentDto } from './dto/update-content.dto.js';

@ApiTags('contents')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('public')
  async listPublished() {
    return this.contentsService.listPublished();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMine(@CurrentUser() user: JwtPayload) {
    return this.contentsService.listMine(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('library')
  async library(@CurrentUser() user: JwtPayload) {
    return this.contentsService.listLibrary(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-url')
  async requestUpload(@CurrentUser() user: JwtPayload, @Body() dto: RequestContentUploadDto) {
    return this.contentsService.requestUpload(user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateContentDto) {
    return this.contentsService.create(user.sub, user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':contentId')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('contentId') contentId: string,
    @Body() dto: UpdateContentDto
  ) {
    return this.contentsService.update(user.sub, contentId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':contentId/checkout')
  async checkout(@CurrentUser() user: JwtPayload, @Param('contentId') contentId: string) {
    return this.contentsService.createCheckout(user.sub, contentId, process.env.APP_URL ?? '');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('library/:purchaseId/download')
  async download(@CurrentUser() user: JwtPayload, @Param('purchaseId') purchaseId: string) {
    return this.contentsService.getDownloadUrl(user.sub, purchaseId);
  }
}

