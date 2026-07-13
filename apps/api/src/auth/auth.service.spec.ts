import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service.js';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockOtpService = {
    generate: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return otp code', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        name: 'Test User',
        phoneNumber: '07701234567',
        role: 'TRAVELER',
        verified: false,
        createdAt: new Date(),
      });
      mockOtpService.generate.mockResolvedValue('123456');

      const result = await service.register({
        name: 'Test User',
        password: 'password123',
        phoneNumber: '07701234567',
      });

      expect(result.name).toBe('Test User');
      expect(result.otpCode).toBe('123456');
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockOtpService.generate).toHaveBeenCalledWith('07701234567');
    });

    it('should reject registration with duplicate phone number', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.register({
          name: 'Test User',
          password: 'password123',
          phoneNumber: '07701234567',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const { hash } = await import('bcrypt-ts');
      const hashedPassword = await hash('password123', 10);
      const user = {
        id: 1,
        name: 'Test User',
        phoneNumber: '07701234567',
        password: hashedPassword,
        role: 'TRAVELER',
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login({
        phoneNumber: '07701234567',
        password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should reject login with wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ phoneNumber: '07701234567', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyPhone', () => {
    it('should verify phone with valid code', async () => {
      mockOtpService.verify.mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verifyPhone({
        phoneNumber: '07701234567',
        code: '123456',
      });

      expect(result.message).toContain('verified');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { phoneNumber: '07701234567' },
        data: { verified: true },
      });
    });

    it('should reject invalid OTP code', async () => {
      mockOtpService.verify.mockResolvedValue(false);

      await expect(
        service.verifyPhone({ phoneNumber: '07701234567', code: '000000' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        phoneNumber: '07701234567',
        role: 'TRAVELER',
        type: 'refresh',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        phoneNumber: '07701234567',
        role: 'TRAVELER',
        name: 'Test',
      });
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('new-token');
    });

    it('should reject non-refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        type: 'access',
      });

      await expect(service.refresh('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
