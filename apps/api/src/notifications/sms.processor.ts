import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus } from '../generated/prisma/enums.js';
import { SmsPayload, SmsProvider } from './sms-provider.interface.js';

export const SMS_MAX_ATTEMPTS = 3;

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

    if (booking.status !== BookingStatus.PENDING) {
      this.logger.warn(
        `Booking ID ${bookingId} has status ${booking.status}, skipping.`,
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

      if (job.attemptsMade >= SMS_MAX_ATTEMPTS) {
        this.logger.error(
          `Booking ${bookingId} exhausted all ${SMS_MAX_ATTEMPTS} attempts, marking as FAILED and restoring seats.`,
        );
        await this.prisma.$transaction(async (tx) => {
          const failedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.FAILED },
            select: { tourId: true, seatsBooked: true },
          });
          await tx.tour.update({
            where: { id: failedBooking.tourId },
            data: {
              availableSeats: { increment: failedBooking.seatsBooked },
            },
          });
        });
        return;
      }

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
