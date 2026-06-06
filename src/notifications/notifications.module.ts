import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SmsProcessor } from './sms.processor.js';

const smsQueueRegistration = BullModule.registerQueue({ name: 'sms_queue' });

@Module({
  imports: [smsQueueRegistration],
  providers: [SmsProcessor],
  exports: [smsQueueRegistration],
})
export class NotificationsModule {}
