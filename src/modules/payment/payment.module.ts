import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { SeatLock } from '../booking/entities/seat-lock.entity';
import { Ticket } from '../booking/entities/ticket.entity';
import { PaymentRecord } from './entities/payment-record.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, SeatLock, Ticket, PaymentRecord])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
