import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { genSalt, hash, compare } from 'bcrypt-ts';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { VerifyPhoneDto } from './dtos/verify-phone.dto.js';
import { OtpService } from '../otp/otp.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, password, phoneNumber } = registerDto;

    const existing = await this.prisma.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'Unable to process registration.',
      );
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        phoneNumber,
        role: 'TRAVELER',
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });

    const otpCode = await this.otpService.generate(phoneNumber);

    return { ...user, otpCode };
  }

  async verifyPhone(dto: VerifyPhoneDto) {
    const { phoneNumber, code } = dto;

    const valid = await this.otpService.verify(phoneNumber, code);
    if (!valid) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    await this.prisma.user.update({
      where: { phoneNumber },
      data: { verified: true },
    });

    return { message: 'Phone number verified successfully.' };
  }

  async resendOtp(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (!user) {
      throw new BadRequestException('User not found.');
    }
    if (user.verified) {
      throw new BadRequestException('Phone number is already verified.');
    }

    const otpCode = await this.otpService.generate(phoneNumber);
    return { message: 'Verification code sent.', otpCode };
  }

  async login(credentials: LoginDto) {
    const { phoneNumber, password } = credentials;

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name,
      verified: user.verified,
      createdAt: user.createdAt.toISOString(),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        { expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        phoneNumber: string;
        role: string;
        type: string;
      }>(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      const newPayload = {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        name: user.name,
        verified: user.verified,
        createdAt: user.createdAt.toISOString(),
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload);
      const newRefreshToken = await this.jwtService.signAsync(
        { ...newPayload, type: 'refresh' },
        { expiresIn: '7d' },
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
