import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { genSalt, hash, compare } from 'bcrypt-ts';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, phoneNumber } = registerDto;

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phoneNumber,
          role: 'TRAVELER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        meta?: { target?: string[] };
        message?: string;
      };
      if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
        throw new ConflictException('Email is already in use');
      }
      this.logger.error(`Registration failed: ${err.message}`);
      throw error;
    }
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
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
        email: string;
        role: string;
        phoneNumber: string;
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
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload);

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
