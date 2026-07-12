import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTourDto } from './dtos/create-tour.dto.js';
import { UpdateTourDto } from './dtos/update-tour.dto.js';
import { TOURS_CACHE_KEY, TOURS_TTL } from './tours.constants.js';
import { GeocodingService } from './geocoding.service.js';

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateTourDto) {
    const tourDate = new Date(dto.date);
    if (tourDate <= new Date()) {
      throw new BadRequestException('Tour date must be in the future.');
    }

    let displayName: string;
    let latitude: number | null;
    let longitude: number | null;

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      displayName = dto.destination;
      latitude = dto.latitude;
      longitude = dto.longitude;
    } else {
      const geo = await this.geocoding.validateDestination(dto.destination);
      displayName = geo.displayName;
      latitude = geo.latitude;
      longitude = geo.longitude;
    }

    const maxSeats = dto.maxSeats ?? 30;

    const tour = await this.prisma.tour.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        destination: displayName,
        latitude,
        longitude,
        date: tourDate,
        priceIQD: dto.priceIQD,
        imageUrl: dto.imageUrl ?? null,
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

  async findOne(id: number) {
    const tour = await this.prisma.tour.findUnique({ where: { id } });
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
    return tour;
  }

  async update(id: number, dto: UpdateTourDto) {
    const existing = await this.prisma.tour.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.date !== undefined) {
      const tourDate = new Date(dto.date);
      if (tourDate <= new Date()) {
        throw new BadRequestException('Tour date must be in the future.');
      }
      data.date = tourDate;
    }
    if (dto.priceIQD !== undefined) data.priceIQD = dto.priceIQD;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;

    if (dto.destination !== undefined && dto.destination !== existing.destination) {
      if (dto.latitude !== undefined && dto.longitude !== undefined) {
        data.destination = dto.destination;
        data.latitude = dto.latitude;
        data.longitude = dto.longitude;
      } else {
        const geo = await this.geocoding.validateDestination(dto.destination);
        data.destination = geo.displayName;
        data.latitude = geo.latitude;
        data.longitude = geo.longitude;
      }
    }

    if (dto.maxSeats !== undefined && dto.maxSeats !== existing.maxSeats) {
      const booked = existing.maxSeats - existing.availableSeats;
      if (dto.maxSeats < booked) {
        throw new BadRequestException(
          `Max seats cannot be less than ${booked} (already booked).`,
        );
      }
      data.maxSeats = dto.maxSeats;
      data.availableSeats = dto.maxSeats - booked;
    }

    const tour = await this.prisma.tour.update({ where: { id }, data });
    await this.cacheManager.del(TOURS_CACHE_KEY);
    return tour;
  }

  async remove(id: number) {
    const existing = await this.prisma.tour.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        tourId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        'Cannot delete a tour with active bookings. Cancel or complete them first.',
      );
    }

    await this.prisma.tour.delete({ where: { id } });
    await this.cacheManager.del(TOURS_CACHE_KEY);
    return { message: 'Tour deleted.' };
  }
}
