import { Injectable } from '@nestjs/common';
import { SmsPayload, SmsProvider } from './sms-provider.interface.js';

@Injectable()
export class ConsoleSmsProvider extends SmsProvider {
  async send(payload: SmsPayload): Promise<void> {
    console.log(
      `[SMS] To: ${payload.phoneNumber} | Message: ${payload.message}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
