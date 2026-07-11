import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateTourDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  priceIQD!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;
}
