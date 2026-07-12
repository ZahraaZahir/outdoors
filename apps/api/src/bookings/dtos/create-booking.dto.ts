import {
  IsNotEmpty,
  IsInt,
  IsString,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { MAX_SEATS_PER_USER_TOTAL } from '../bookings.constants.js';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  tourId!: number;

  @IsNotEmpty()
  @IsString()
  passengerName!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:\+964|0)?7[5789]\d{8}$/, {
    message:
      'Phone number must be a valid Iraqi mobile format (Zain, Asiacell, or Korek)',
  })
  phoneNumber!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(MAX_SEATS_PER_USER_TOTAL, {
    message: `You cannot book more than ${MAX_SEATS_PER_USER_TOTAL} seats total across all tours.`,
  })
  seatsBooked!: number;
}
