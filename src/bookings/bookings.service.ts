import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sms_queue') private readonly smsQueue: Queue,
  ) {}

  async create(dto: CreateBookingDto, userId: number) {
    const { tourId, passengerName, phoneNumber, seatsBooked } = dto;

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
