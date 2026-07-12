import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^(?:\+964|0)?7[5789]\d{8}$/, {
    message:
      'Phone number must be a valid Iraqi mobile format (Zain, Asiacell, or Korek)',
  })
  phoneNumber!: string;

  // Explicitly reject any role field sent in the request body.
  // Admin role must be assigned via database or a separate admin action.
  role?: never;
}
