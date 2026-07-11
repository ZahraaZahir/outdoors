import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.create(dto, user.id);
  }

  @Get()
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.findMine(user.id);
  }
}
