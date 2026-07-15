import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import KeyvRedis from '@keyv/redis';

import { AuthModule } from './auth/auth.module.js';
import { ToursModule } from './tours/tours.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module.js';
import config from './config/config.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { UploadsModule } from './uploads/uploads.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url');
        if (!redisUrl) {
          throw new Error('FATAL: Redis URL configuration is missing.');
        }
        return {
          stores: [new KeyvRedis(redisUrl)],
        };
      },
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url');

        if (!redisUrl) {
          throw new Error('FATAL: Redis URL configuration is missing.');
        }

        const url = new URL(redisUrl);

        return {
          connection: {
            host: url.hostname,
            port: Number(url.port),
            username: url.username || 'default',
            password: url.password,
            tls:
              url.protocol === 'rediss:'
                ? { rejectUnauthorized: false }
                : undefined,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),

    PrismaModule,
    AuthModule,
    ToursModule,
    BookingsModule,
    NotificationsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
