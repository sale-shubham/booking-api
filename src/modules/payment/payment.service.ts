import { createHmac, timingSafeEqual } from 'crypto';
import * as QRCode from 'qrcode';
import Razorpay from 'razorpay';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { SeatLock } from '../booking/entities/seat-lock.entity';
import { Ticket, TicketStatus } from '../booking/entities/ticket.entity';
import { PaymentRecord, PaymentStatus } from './entities/payment-record.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly razorpay: Razorpay;

  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(SeatLock) private readonly seatLocks: Repository<SeatLock>,
    @InjectRepository(PaymentRecord) private readonly payments: Repository<PaymentRecord>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get<string>('razorpay.keyId')!,
      key_secret: this.config.get<string>('razorpay.keySecret')!,
    });
  }

  async createOrder(bookingId: string, userId: string) {
    const booking = await this.bookings.findOne({ where: { id: bookingId } });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('Booking does not belong to you');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Booking is ${booking.status}, cannot be paid`);
    }

    const amountPaise = Math.round(Number(booking.totalAmount) * 100);
    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: booking.id,
    });

    await this.payments.save(
      this.payments.create({
        bookingId: booking.id,
        provider: 'razorpay',
        providerOrderId: order.id,
        status: PaymentStatus.CREATED,
        amount: booking.totalAmount,
      }),
    );

    return {
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: this.config.get<string>('razorpay.keyId'),
    };
  }

  verifySignature(rawBody: Buffer, signature: string): boolean {
    const secret = this.config.get<string>('razorpay.webhookSecret')!;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(signature ?? '', 'utf8');
    return expectedBuf.length === actualBuf.length && timingSafeEqual(expectedBuf, actualBuf);
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.verifySignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.event !== 'payment.captured') {
      return { ignored: event.event };
    }

    const paymentEntity = event.payload?.payment?.entity;
    const orderId: string = paymentEntity?.order_id;
    const paymentId: string = paymentEntity?.id;
    if (!orderId || !paymentId) {
      throw new BadRequestException('Malformed webhook payload');
    }

    const record = await this.payments.findOne({ where: { providerOrderId: orderId } });
    if (!record) {
      throw new BadRequestException('No matching payment record for order');
    }
    if (record.status === PaymentStatus.CAPTURED) {
      return { alreadyProcessed: true };
    }

    await this.dataSource.transaction(async (manager) => {
      record.status = PaymentStatus.CAPTURED;
      record.providerPaymentId = paymentId;
      await manager.save(record);

      const booking = await manager.findOneOrFail(Booking, { where: { id: record.bookingId } });
      booking.status = BookingStatus.PAID;
      await manager.save(booking);

      const locks = await manager.find(SeatLock, { where: { bookingId: booking.id } });
      for (const lock of locks) {
        const qrPayload = JSON.stringify({ bookingId: booking.id, seatId: lock.seatId });
        const qrCode = await QRCode.toDataURL(qrPayload);
        const ticket = manager.create(Ticket, {
          bookingId: booking.id,
          seatId: lock.seatId,
          qrCode,
          status: TicketStatus.ACTIVE,
        });
        await manager.save(ticket);
      }
      await manager.delete(SeatLock, { bookingId: booking.id });
    });

    this.logger.log(`Booking ${record.bookingId} paid, tickets issued`);
    return { success: true };
  }
}
