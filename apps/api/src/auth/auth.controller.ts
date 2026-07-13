import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { VerifyPhoneDto } from './dtos/verify-phone.dto.js';
import {
  RateLimit,
  RateLimitGuard,
} from '../common/guards/rate-limit.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RateLimit(60_000, 5)
  @UseGuards(RateLimitGuard)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @RateLimit(60_000, 10)
  @UseGuards(RateLimitGuard)
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @RateLimit(60_000, 10)
  @UseGuards(RateLimitGuard)
  @Post('verify')
  async verifyPhone(@Body() dto: VerifyPhoneDto) {
    return this.authService.verifyPhone(dto);
  }

  @RateLimit(60_000, 3)
  @UseGuards(RateLimitGuard)
  @Post('resend-otp')
  async resendOtp(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.resendOtp(phoneNumber);
  }

  @RateLimit(60_000, 10)
  @UseGuards(RateLimitGuard)
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
