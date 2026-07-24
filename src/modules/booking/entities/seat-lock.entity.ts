import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Volatile-by-convention: rows here represent a temporary claim on a seat.
 * Deleted when the booking is paid, cancelled, or the lock expires (cron in booking.service.ts).
 * The UNIQUE(showtime_id, seat_id) constraint is what actually prevents double-booking —
 * it makes the INSERT ... ON CONFLICT DO NOTHING in BookingService.lockSeats atomic.
 */
@Entity('seat_locks')
@Index(['showtimeId', 'seatId'], { unique: true })
export class SeatLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'showtime_id' })
  showtimeId: string;

  @Column({ name: 'seat_id' })
  seatId: string;

  @Column({ name: 'lock_token' })
  lockToken: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
