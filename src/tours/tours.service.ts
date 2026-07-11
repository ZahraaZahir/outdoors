import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTourDto } from './dtos/create-tour.dto.js';
import { TOURS_CACHE_KEY, TOURS_TTL } from './tours.constants.js';

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateTourDto) {
    const maxSeats = dto.maxSeats ?? 30;
    const tour = await this.prisma.tour.create({
      data: {
        title: dto.title,
        destination: dto.destination,
        date: new Date(dto.date),
        priceIQD: dto.priceIQD,
        maxSeats: maxSeats,
        availableSeats: maxSeats,
      },
    });

    await this.cacheManager.del(TOURS_CACHE_KEY);
    return tour;
  }

  async findAll() {
    const cached = await this.cacheManager.get(TOURS_CACHE_KEY);
    if (cached) {
      this.logger.log('Serving upcoming tours from Redis cache.');
      return cached;
    }

    this.logger.log('Fetching upcoming tours from PostgreSQL.');

    const tours = await this.prisma.tour.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    });

    await this.cacheManager.set(TOURS_CACHE_KEY, tours, TOURS_TTL);
    return tours;
  }
}
