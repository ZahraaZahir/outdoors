import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { ToursService } from './tours.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GeocodingService } from './geocoding.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ToursService', () => {
  let service: ToursService;

  const mockPrisma = {
    tour: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      count: jest.fn(),
    },
  };

  const mockGeocoding = {
    validateDestination: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToursService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GeocodingService, useValue: mockGeocoding },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<ToursService>(ToursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tour with valid data', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      mockGeocoding.validateDestination.mockResolvedValue({
        displayName: 'Erbil, Iraq',
        latitude: 36.19,
        longitude: 44.01,
      });
      mockPrisma.tour.create.mockResolvedValue({
        id: 1,
        title: 'Test Tour',
        destination: 'Erbil, Iraq',
      });

      const result = await service.create({
        title: 'Test Tour',
        destination: 'Erbil',
        date: futureDate.toISOString(),
        priceIQD: 50000,
      });

      expect(result.title).toBe('Test Tour');
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should reject tour with past date', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      await expect(
        service.create({
          title: 'Past Tour',
          destination: 'Erbil',
          date: pastDate.toISOString(),
          priceIQD: 50000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a tour by id', async () => {
      const tour = { id: 1, title: 'Test Tour' };
      mockPrisma.tour.findUnique.mockResolvedValue(tour);

      const result = await service.findOne(1);
      expect(result).toEqual(tour);
    });

    it('should throw NotFoundException for non-existent tour', async () => {
      mockPrisma.tour.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a tour with no active bookings', async () => {
      mockPrisma.tour.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.booking.count.mockResolvedValue(0);
      mockPrisma.tour.delete.mockResolvedValue({});

      const result = await service.remove(1);
      expect(result.message).toContain('deleted');
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should reject deleting tour with active bookings', async () => {
      mockPrisma.tour.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.booking.count.mockResolvedValue(3);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should reject deleting non-existent tour', async () => {
      mockPrisma.tour.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
