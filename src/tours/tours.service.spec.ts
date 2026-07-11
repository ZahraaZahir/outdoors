import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { jest } from '@jest/globals';

describe('ToursService', () => {
  let service: ToursService;

  const mockPrisma = {
    tour: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToursService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<ToursService>(ToursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
