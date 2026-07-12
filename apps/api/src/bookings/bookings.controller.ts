import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/authenticated-request.interface.js';
import {
  RateLimit,
  RateLimitGuard,
} from '../common/guards/rate-limit.guard.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @RateLimit(60_000, 5)
  @UseGuards(RateLimitGuard)
  @Post()
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bookingsService.create(dto, user.id, user.phoneNumber);
  }

  @Get()
  async findMine(@CurrentUser() user: UserPayload) {
    return this.bookingsService.findMine(user.id);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bookingsService.cancel(id, user.id);
  }
}
