import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingStatus } from '../generated/prisma/client.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { MAX_SEATS_PER_USER_PER_TOUR } from './bookings.constants.js';
import { TOURS_CACHE_KEY } from '../tours/tours.constants.js';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sms_queue') private readonly smsQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateBookingDto, userId: number) {
    const { tourId, passengerName, phoneNumber, seatsBooked } = dto;

    const existingBookings = await this.prisma.booking.aggregate({
      where: {
        tourId,
        OR: [{ userId }, { phoneNumber }],
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      _sum: {
        seatsBooked: true,
      },
    });

    const currentlyBooked = existingBookings._sum.seatsBooked || 0;

    if (currentlyBooked + seatsBooked > MAX_SEATS_PER_USER_PER_TOUR) {
      throw new BadRequestException(
        `Booking rejected. Seat limit per user/phone on this tour is ${MAX_SEATS_PER_USER_PER_TOUR}. 
        You currently have ${currentlyBooked} seats booked.`,
      );
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.tour.updateMany({
        where: {
          id: tourId,
          availableSeats: { gte: seatsBooked },
        },
        data: {
          availableSeats: { decrement: seatsBooked },
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestException(
          'Not enough available seats on this tour.',
        );
      }

      return tx.booking.create({
        data: {
          tourId,
          userId,
          passengerName,
          phoneNumber,
          seatsBooked,
        },
      });
    });

    await this.cacheManager.del(TOURS_CACHE_KEY);

    await this.smsQueue.add(
      'send-confirmation',
      {
        bookingId: booking.id,
        passengerName: booking.passengerName,
        phoneNumber: booking.phoneNumber,
      },
      {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    );

    return booking;
  }
}
