import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTourDto } from './dtos/create-tour.dto.js';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTourDto) {
    const maxSeats = dto.maxSeats ?? 30;

    return this.prisma.tour.create({
      data: {
        title: dto.title,
        destination: dto.destination,
        date: new Date(dto.date),
        priceIQD: dto.priceIQD,
        maxSeats: maxSeats,
        availableSeats: maxSeats,
      },
    });
  }

  async findAll() {
    return this.prisma.tour.findMany({
      orderBy: { date: 'asc' },
    });
  }
}
