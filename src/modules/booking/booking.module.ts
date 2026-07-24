import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenModule } from '../screen/screen.module';
import { ShowtimeModule } from '../showtime/showtime.module';
import { SeatLock } from './entities/seat-lock.entity';
import { Booking } from './entities/booking.entity';
import { Ticket } from './entities/ticket.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeatLock, Booking, Ticket]),
    ScreenModule,
    ShowtimeModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
