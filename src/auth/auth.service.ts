import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dtos/register.dto.js';
import { genSalt, hash } from 'bcrypt-ts';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, phoneNumber } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

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
  }
}
