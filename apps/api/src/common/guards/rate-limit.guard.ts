import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (ttlMs: number, maxRequests: number) =>
  SetMetadata(RATE_LIMIT_KEY, { ttlMs, maxRequests });

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.get<{ ttlMs: number; maxRequests: number }>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!meta) return true;

    const { ttlMs, maxRequests } = meta;
    const req = context.switchToHttp().getRequest();
    const key = `${req.ip}:${context.getHandler().name}`;
    const now = Date.now();

    const entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + ttlMs });
      return true;
    }

    entry.count++;
    if (entry.count > maxRequests) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
