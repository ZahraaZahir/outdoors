import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SmsProcessor } from './sms.processor.js';
import { SmsProvider } from './sms-provider.interface.js';
import { ConsoleSmsProvider } from './console-sms.provider.js';

const smsQueueRegistration = BullModule.registerQueue({ name: 'sms_queue' });

@Module({
  imports: [smsQueueRegistration],
  providers: [
    SmsProcessor,
    { provide: SmsProvider, useClass: ConsoleSmsProvider },
  ],
  exports: [smsQueueRegistration],
})
export class NotificationsModule {}
