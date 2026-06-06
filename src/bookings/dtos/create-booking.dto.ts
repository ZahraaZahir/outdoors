import { IsNotEmpty, IsInt, IsString, Min, Max } from 'class-validator';
import { MAX_SEATS_PER_USER_PER_TOUR } from '../bookings.constants.js';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  tourId!: number;

  @IsNotEmpty()
  @IsString()
  passengerName!: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(MAX_SEATS_PER_USER_PER_TOUR, {
    message: `You cannot book more than ${MAX_SEATS_PER_USER_PER_TOUR} seats.`,
  })
  seatsBooked!: number;
}
