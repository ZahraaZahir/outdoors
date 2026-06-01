import { Controller, Post, Get, Body } from '@nestjs/common';
import { ToursService } from './tours.service.js';
import { CreateTourDto } from './dtos/create-tour.dto.js';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  async create(@Body() dto: CreateTourDto) {
    return this.toursService.create(dto);
  }

  @Get()
  async findAll() {
    return this.toursService.findAll();
  }
}
