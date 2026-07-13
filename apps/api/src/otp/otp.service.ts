import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SmsProvider } from '../notifications/sms-provider.interface.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_LENGTH = 6;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly smsProvider: SmsProvider,
  ) {}

  private cacheKey(phoneNumber: string): string {
    return `otp:${phoneNumber}`;
  }

  async generate(phoneNumber: string): Promise<string> {
    const code = Array.from({ length: OTP_LENGTH }, () =>
      Math.floor(Math.random() * 10),
    ).join('');

    await this.cache.set(this.cacheKey(phoneNumber), code, OTP_TTL_MS);

    await this.smsProvider.send({
      phoneNumber,
      message: `Your verification code is: ${code}. It expires in 5 minutes.`,
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`OTP sent to ${phoneNumber}: ${code}`);
    }

    return code;
  }

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    const stored = await this.cache.get<string>(this.cacheKey(phoneNumber));
    if (!stored || stored !== code) {
      return false;
    }
    await this.cache.del(this.cacheKey(phoneNumber));
    return true;
  }
}
