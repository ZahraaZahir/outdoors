import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { UserPayload } from '../auth/interfaces/authenticated-request.interface.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.bookingsService.create(dto, user.id);
  }

  @Get()
  async findMine(@CurrentUser() user: UserPayload) {
    return this.bookingsService.findMine(user.id);
  }
}
