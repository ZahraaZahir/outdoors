import { Module } from '@nestjs/common';
import { ToursController } from './tours.controller.js';
import { ToursService } from './tours.service.js';
import { GeocodingService } from './geocoding.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ToursController],
  providers: [ToursService, GeocodingService],
})
export class ToursModule {}
