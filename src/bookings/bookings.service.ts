import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto, userId: number) {
    const { tourId, passengerName, phoneNumber, seatsBooked } = dto;

    return this.prisma.$transaction(async (tx) => {
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
  }
}
