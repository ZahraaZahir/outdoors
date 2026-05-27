import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ToursModule } from './tours/tours.module.js';
import { BookingsModule } from './bookings/bookings.module.js';

@Module({
  imports: [AuthModule, ToursModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
