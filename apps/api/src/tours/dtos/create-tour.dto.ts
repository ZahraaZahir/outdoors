import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';
import { MAX_PRICE_IQD, MAX_SEATS_PER_TOUR } from '../tours.constants.js';

export class CreateTourDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters.' })
  title!: string;

  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(MAX_PRICE_IQD, {
    message: `Price cannot exceed ${MAX_PRICE_IQD.toLocaleString()} IQD.`,
  })
  priceIQD!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_SEATS_PER_TOUR, {
    message: `Max seats cannot exceed ${MAX_SEATS_PER_TOUR}.`,
  })
  maxSeats?: number;
}
