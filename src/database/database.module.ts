import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../modules/tenant/entities/tenant.entity';
import { User } from '../modules/auth/entities/user.entity';
import { Cinema } from '../modules/cinema/entities/cinema.entity';
import { Screen } from '../modules/screen/entities/screen.entity';
import { Seat } from '../modules/screen/entities/seat.entity';
import { Movie } from '../modules/movie/entities/movie.entity';
import { Showtime } from '../modules/showtime/entities/showtime.entity';
import { SeatLock } from '../modules/booking/entities/seat-lock.entity';
import { Booking } from '../modules/booking/entities/booking.entity';
import { Ticket } from '../modules/booking/entities/ticket.entity';
import { PaymentRecord } from '../modules/payment/entities/payment-record.entity';

export const ENTITIES = [
  Tenant,
  User,
  Cinema,
  Screen,
  Seat,
  Movie,
  Showtime,
  SeatLock,
  Booking,
  Ticket,
  PaymentRecord,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: ENTITIES,
        synchronize: false,
        migrationsRun: false,
        ssl: { rejectUnauthorized: false },
      }),
    }),
  ],
})
export class DatabaseModule {}
