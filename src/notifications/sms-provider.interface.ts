export interface SmsPayload {
  phoneNumber: string;
  message: string;
}

export abstract class SmsProvider {
  abstract send(payload: SmsPayload): Promise<void>;
}
