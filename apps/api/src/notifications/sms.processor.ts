import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus } from '../generated/prisma/enums.js';
import { SmsPayload, SmsProvider } from './sms-provider.interface.js';

interface SmsJobData {
  bookingId: number;
  passengerName: string;
  phoneNumber: string;
}

@Processor('sms_queue')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

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
      this.logger.warn(
        `Booking ID ${bookingId} is already CONFIRMED, skipping.`,
      );
      return;
    }

    const payload: SmsPayload = {
      phoneNumber,
      message: `Hi ${passengerName}, your booking (ID: ${bookingId}) has been confirmed!`,
    };

    try {
      await this.smsProvider.send(payload);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`SMS send failed for booking ${bookingId}: ${message}`);
      throw error;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
        });
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update booking ${bookingId} status: ${message}`,
      );
      throw error;
    }

    this.logger.log(`Booking ID ${bookingId} set to CONFIRMED.`);
  }
}
