import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyPhoneDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^(?:\+964|0)?7[5789]\d{8}$/, {
    message:
      'Phone number must be a valid Iraqi mobile format (Zain, Asiacell, or Korek)',
  })
  phoneNumber!: string;

  @IsNotEmpty({ message: 'Verification code is required' })
  @IsString()
  @Length(6, 6, { message: 'Code must be 6 digits' })
  code!: string;
}
