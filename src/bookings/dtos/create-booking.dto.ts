import { IsNotEmpty, IsInt, IsString, Min } from 'class-validator';

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
  seatsBooked!: number;
}
