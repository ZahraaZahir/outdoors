import { Test, TestingModule } from '@nestjs/testing';
import { ToursController } from './tours.controller.js';
import { ToursService } from './tours.service.js';
import { jest } from '@jest/globals';

describe('ToursController', () => {
  let controller: ToursController;

  const mockToursService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToursController],
      providers: [{ provide: ToursService, useValue: mockToursService }],
    }).compile();

    controller = module.get<ToursController>(ToursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
