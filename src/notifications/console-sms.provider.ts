import { Injectable, Logger } from '@nestjs/common';
import { SmsPayload, SmsProvider } from './sms-provider.interface.js';

@Injectable()
export class ConsoleSmsProvider extends SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  async send(payload: SmsPayload): Promise<void> {
    this.logger.log(`To: ${payload.phoneNumber} | Message: ${payload.message}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
