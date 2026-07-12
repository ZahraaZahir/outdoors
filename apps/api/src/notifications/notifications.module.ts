import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SmsProcessor } from './sms.processor.js';
import { SmsProvider } from './sms-provider.interface.js';
import { ConsoleSmsProvider } from './console-sms.provider.js';
import { PrismaModule } from '../prisma/prisma.module.js';

const smsQueueRegistration = BullModule.registerQueue({ name: 'sms_queue' });

@Module({
  imports: [PrismaModule, smsQueueRegistration],
  providers: [
    SmsProcessor,
    { provide: SmsProvider, useClass: ConsoleSmsProvider },
  ],
  exports: [smsQueueRegistration, SmsProvider],
})
export class NotificationsModule {}
