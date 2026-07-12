import {
  IsNotEmpty,
  IsInt,
  IsString,
  Min,
  Max,
  Length,
} from 'class-validator';
import { MAX_SEATS_PER_USER_TOTAL } from '../bookings.constants.js';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  tourId!: number;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100, { message: 'Passenger name must be between 2 and 100 characters.' })
  passengerName!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(MAX_SEATS_PER_USER_TOTAL, {
    message: `You cannot book more than ${MAX_SEATS_PER_USER_TOTAL} seats total across all tours.`,
  })
  seatsBooked!: number;
}
