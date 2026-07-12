import { Module } from '@nestjs/common';
import { OtpService } from './otp.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
