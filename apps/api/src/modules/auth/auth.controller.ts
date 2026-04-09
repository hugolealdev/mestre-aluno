import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { JwtPayload } from './types/jwt-payload.type.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.register(dto);
    this.attachRefreshCookie(response, tokens.refreshToken);
    return tokens;
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(dto);
    this.attachRefreshCookie(response, tokens.refreshToken);
    return tokens;
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = dto.refreshToken ?? request.cookies.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token ausente.');
    }

    const tokens = await this.authService.refreshByToken(refreshToken);
    this.attachRefreshCookie(response, tokens.refreshToken);
    return tokens;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload, @Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshToken');
    return this.authService.logout(user.sub);
  }

  private attachRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }
}
