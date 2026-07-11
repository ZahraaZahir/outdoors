import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus } from '../generated/prisma/client.js';
import { SmsPayload, SmsProvider } from './sms-provider.interface.js';

interface SmsJobData {
  bookingId: number;
  passengerName: string;
  phoneNumber: string;
}

@Processor('sms_queue')
export class SmsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsProvider: SmsProvider,
  ) {
    super();
  }

  async process(job: Job<SmsJobData>): Promise<void> {
    const { bookingId, passengerName, phoneNumber } = job.data;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true },
    });

    if (!booking) {
      throw new Error(
        `Execution aborted: Booking ID ${bookingId} does not exist.`,
      );
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      console.log(
        `Execution bypassed: Booking ID ${bookingId} is already CONFIRMED.`,
      );
      return;
    }

    const payload = new SmsPayload();
    payload.phoneNumber = phoneNumber;
    payload.message = `Hi ${passengerName}, your booking (ID: ${bookingId}) has been confirmed!`;

    await this.smsProvider.send(payload);

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    console.log(
      `State Transition Complete: Booking ID ${bookingId} set to CONFIRMED.`,
    );
  }
}
