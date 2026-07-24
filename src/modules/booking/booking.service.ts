import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { ScreenService } from '../screen/screen.service';
import { ShowtimeService } from '../showtime/showtime.service';
import { Seat } from '../screen/entities/seat.entity';
import { SeatLock } from './entities/seat-lock.entity';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Ticket } from './entities/ticket.entity';

export interface SeatMapEntry {
  id: string;
  row: number;
  col: number;
  category: string;
  status: 'available' | 'locked' | 'booked';
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(SeatLock) private readonly seatLocks: Repository<SeatLock>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly screens: ScreenService,
    private readonly showtimes: ShowtimeService,
    private readonly config: ConfigService,
  ) {}

  async getSeatMap(showtimeId: string): Promise<SeatMapEntry[]> {
    const showtime = await this.showtimes.findOne(showtimeId);
    const seats = await this.screens.getSeats(showtime.screenId);

    const bookedSeatIds = new Set(
      (
        await this.tickets
          .createQueryBuilder('ticket')
          .innerJoin('ticket.booking', 'booking')
          .where('booking.showtimeId = :showtimeId', { showtimeId })
          .andWhere('ticket.status = :status', { status: 'active' })
          .select('ticket.seatId', 'seatId')
          .getRawMany<{ seatId: string }>()
      ).map((r) => r.seatId),
    );

    const lockedSeatIds = new Set(
      (
        await this.seatLocks.find({
          where: { showtimeId },
        })
      )
        .filter((lock) => lock.expiresAt.getTime() > Date.now())
        .map((lock) => lock.seatId),
    );

    return seats.map((seat: Seat) => ({
      id: seat.id,
      row: seat.row,
      col: seat.col,
      category: seat.category,
      status: bookedSeatIds.has(seat.id)
        ? 'booked'
        : lockedSeatIds.has(seat.id)
          ? 'locked'
          : 'available',
    }));
  }

  async lockSeats(showtimeId: string, seatIds: string[], userId: string) {
    const showtime = await this.showtimes.findOne(showtimeId);
    const seats = await this.screens.getSeats(showtime.screenId);
    const validSeatIds = new Set(seats.map((s) => s.id));
    const invalid = seatIds.filter((id) => !validSeatIds.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException(`Seats not part of this showtime's screen: ${invalid.join(', ')}`);
    }

    const alreadyBooked = (
      await this.tickets
        .createQueryBuilder('ticket')
        .innerJoin('ticket.booking', 'booking')
        .where('booking.showtimeId = :showtimeId', { showtimeId })
        .andWhere('ticket.status = :status', { status: 'active' })
        .andWhere('ticket.seatId IN (:...seatIds)', { seatIds })
        .select('ticket.seatId', 'seatId')
        .getRawMany<{ seatId: string }>()
    ).map((r) => r.seatId);
    if (alreadyBooked.length > 0) {
      throw new ConflictException(`Seats already booked: ${alreadyBooked.join(', ')}`);
    }

    const lockToken = randomUUID();
    const ttlMinutes = this.config.get<number>('seatLockTtlMinutes') ?? 10;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const failedSeatIds: string[] = [];
    await this.dataSource.transaction(async (manager) => {
      for (const seatId of seatIds) {
        const result = await manager.query(
          `INSERT INTO seat_locks (showtime_id, seat_id, lock_token, user_id, expires_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (showtime_id, seat_id)
           DO UPDATE SET lock_token = EXCLUDED.lock_token, user_id = EXCLUDED.user_id, expires_at = EXCLUDED.expires_at
           WHERE seat_locks.expires_at < now()
           RETURNING id`,
          [showtimeId, seatId, lockToken, userId, expiresAt],
        );
        if (!result || result.length === 0) {
          failedSeatIds.push(seatId);
        }
      }
      if (failedSeatIds.length > 0) {
        throw new ConflictException(`Seats currently held by another user: ${failedSeatIds.join(', ')}`);
      }
    });

    return { lockToken, expiresAt, seatIds };
  }

  async createBooking(userId: string, showtimeId: string, lockToken: string) {
    const showtime = await this.showtimes.findOne(showtimeId);
    const locks = await this.seatLocks.find({
      where: { showtimeId, lockToken, userId },
    });
    if (locks.length === 0) {
      throw new BadRequestException('Lock expired or invalid — reselect your seats');
    }
    if (locks.some((lock) => lock.expiresAt.getTime() <= Date.now())) {
      throw new BadRequestException('Seat hold expired — reselect your seats');
    }

    const seats = await this.screens.getSeats(showtime.screenId);
    const seatById = new Map(seats.map((s) => [s.id, s]));
    const totalAmount = locks.reduce((sum, lock) => {
      const seat = seatById.get(lock.seatId);
      const price = seat ? (showtime.priceByCategory[seat.category] ?? 0) : 0;
      return sum + price;
    }, 0);

    const booking = await this.bookings.save(
      this.bookings.create({
        userId,
        showtimeId,
        lockToken,
        status: BookingStatus.PENDING,
        totalAmount: totalAmount.toFixed(2),
      }),
    );

    await this.seatLocks.update({ showtimeId, lockToken, userId }, { bookingId: booking.id });

    return this.findOne(booking.id, userId);
  }

  async findOne(id: string, userId?: string) {
    const booking = await this.bookings.findOne({ where: { id }, relations: { tickets: true } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (userId && booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredLocks() {
    const now = new Date();
    const expired = await this.seatLocks.find({ where: { expiresAt: LessThan(now) } });
    const expiredBookingIds = [
      ...new Set(expired.filter((lock) => lock.bookingId).map((lock) => lock.bookingId!)),
    ];

    if (expiredBookingIds.length > 0) {
      await this.bookings.update(
        { id: In(expiredBookingIds), status: BookingStatus.PENDING },
        { status: BookingStatus.EXPIRED },
      );
    }

    if (expired.length > 0) {
      await this.seatLocks.delete({ expiresAt: LessThan(now) });
      this.logger.log(`Released ${expired.length} expired seat lock(s)`);
    }
  }
}
