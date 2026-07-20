import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { BookingsService } from './bookings.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from '../generated/prisma/enums.js';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockTransaction = jest.fn();
  const mockPrisma = {
    booking: {
      aggregate: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    tour: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: mockTransaction,
  };

  const mockQueue = {
    add: jest.fn(),
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
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken('sms_queue'), useValue: mockQueue },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    it('should create a booking successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ verified: true });

      const bookingResult = {
        id: 1,
        tourId: 1,
        userId: 1,
        passengerName: 'Test',
        phoneNumber: '07701234567',
        seatsBooked: 2,
        status: 'PENDING',
        createdAt: new Date(),
      };

      mockTransaction.mockImplementation(
        async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
          return fn({
            booking: {
              aggregate: jest
                .fn()
                .mockResolvedValue({ _sum: { seatsBooked: 0 } }),
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue(bookingResult),
            },
            tour: {
              findUnique: jest.fn().mockResolvedValue({
                id: 1,
                date: futureDate,
                availableSeats: 10,
              }),
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
          });
        },
      );

      const result = await service.create(
        { tourId: 1, passengerName: 'Test', seatsBooked: 2 },
        1,
        '07701234567',
      );

      expect(result.id).toBe(1);
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('should reject booking from unverified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ verified: false });

      await expect(
        service.create(
          { tourId: 1, passengerName: 'Test', seatsBooked: 1 },
          1,
          '07701234567',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject booking when user has existing booking on same tour', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ verified: true });

      mockTransaction.mockImplementation(
        async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
          return fn({
            booking: {
              aggregate: jest
                .fn()
                .mockResolvedValue({ _sum: { seatsBooked: 1 } }),
              findFirst: jest
                .fn()
                .mockResolvedValueOnce({ id: 99 }) // alreadyBookedOnTour
                .mockResolvedValueOnce(null),
              create: jest.fn(),
            },
            tour: {
              findUnique: jest.fn(),
              updateMany: jest.fn(),
            },
          });
        },
      );

      await expect(
        service.create(
          { tourId: 1, passengerName: 'Test', seatsBooked: 1 },
          1,
          '07701234567',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    it('should cancel a booking and restore seats', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        tourId: 1,
        seatsBooked: 2,
        status: BookingStatus.CONFIRMED,
        tour: { date: futureDate },
      });
      mockPrisma.$transaction.mockResolvedValue(undefined);

      const result = await service.cancel(1, 1);

      expect(result.message).toContain('cancelled');
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should reject cancelling a non-existent booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.cancel(999, 1)).rejects.toThrow(BadRequestException);
    });

    it("should reject cancelling another user's booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
        tourId: 1,
        seatsBooked: 2,
        status: BookingStatus.CONFIRMED,
        tour: { date: futureDate },
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling an already cancelled booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        tourId: 1,
        seatsBooked: 2,
        status: BookingStatus.CANCELLED,
        tour: { date: futureDate },
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
