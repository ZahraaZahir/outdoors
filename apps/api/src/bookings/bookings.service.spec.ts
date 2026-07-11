import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getQueueToken } from '@nestjs/bullmq';
import { jest } from '@jest/globals';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockPrisma = {
    booking: {
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    tour: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
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
});
