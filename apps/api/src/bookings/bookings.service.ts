import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BookingStatus } from '../generated/prisma/enums.js';
import type { Booking } from '../generated/prisma/client.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { MAX_SEATS_PER_USER_TOTAL } from './bookings.constants.js';
import { SMS_MAX_ATTEMPTS } from '../notifications/sms.processor.js';
import { TOURS_CACHE_KEY } from '../tours/tours.constants.js';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sms_queue') private readonly smsQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateBookingDto, userId: number, phoneNumber: string) {
    const { tourId, passengerName, seatsBooked } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { verified: true },
    });

    if (!user || !user.verified) {
      throw new BadRequestException(
        'Please verify your phone number before booking a tour.',
      );
    }

    let booking: Booking;
    try {
      booking = await this.prisma.$transaction(async (tx) => {
        const existingBookings = await tx.booking.aggregate({
          where: {
            userId,
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          },
          _sum: {
            seatsBooked: true,
          },
        });

        const alreadyBookedOnTour = await tx.booking.findFirst({
          where: {
            userId,
            tourId,
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          },
        });

        if (alreadyBookedOnTour) {
          throw new BadRequestException(
            'You have already booked this tour. Modify your existing booking instead.',
          );
        }

        const targetTour = await tx.tour.findUnique({ where: { id: tourId } });
        if (!targetTour) {
          throw new BadRequestException('Tour not found.');
        }

        if (new Date(targetTour.date) <= new Date()) {
          throw new BadRequestException(
            'Cannot book a tour that has already passed.',
          );
        }

        const targetDate = new Date(targetTour.date);
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const conflict = await tx.booking.findFirst({
          where: {
            userId,
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
            tour: {
              date: { gte: dayStart, lte: dayEnd },
            },
          },
        });

        if (conflict) {
          throw new BadRequestException(
            'You already have a booking on this date. You cannot attend two tours on the same day.',
          );
        }

        const currentlyBooked = existingBookings._sum.seatsBooked || 0;

        if (currentlyBooked + seatsBooked > MAX_SEATS_PER_USER_TOTAL) {
          throw new BadRequestException(
            `Booking rejected. Total seat limit across all tours is ${MAX_SEATS_PER_USER_TOTAL}. You currently have ${currentlyBooked} seats booked.`,
          );
        }

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
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Booking transaction failed: ${message}`);
      throw new BadRequestException(
        'Failed to create booking. Please try again.',
      );
    }

    await this.cacheManager.del(TOURS_CACHE_KEY);

    await this.smsQueue.add(
      'send-confirmation',
      {
        bookingId: booking.id,
        passengerName: booking.passengerName,
        phoneNumber: booking.phoneNumber,
      },
      {
        attempts: SMS_MAX_ATTEMPTS,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    );

    return booking;
  }

  async findMine(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        tour: {
          select: { id: true, title: true, destination: true, date: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(bookingId: number, userId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tour: true },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found.');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only cancel your own bookings.');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled.');
    }

    if (new Date(booking.tour.date) <= new Date()) {
      throw new BadRequestException(
        'Cannot cancel a booking for a tour that has already passed.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      await tx.tour.update({
        where: { id: booking.tourId },
        data: { availableSeats: { increment: booking.seatsBooked } },
      });
    });

    await this.cacheManager.del(TOURS_CACHE_KEY);

    return { message: 'Booking cancelled. Seats restored.' };
  }
}
