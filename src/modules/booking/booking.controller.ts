import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { BookingService } from './booking.service';
import { LockSeatsDto } from './dto/lock-seats.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('booking')
@Controller()
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Public()
  @Get('showtimes/:id/seats')
  getSeatMap(@Param('id') showtimeId: string) {
    return this.booking.getSeatMap(showtimeId);
  }

  @Post('showtimes/:id/lock-seats')
  lockSeats(@Param('id') showtimeId: string, @CurrentUser() user: AuthUser, @Body() dto: LockSeatsDto) {
    return this.booking.lockSeats(showtimeId, dto.seatIds, user.userId);
  }

  @Post('bookings')
  createBooking(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.booking.createBooking(user.userId, dto.showtimeId, dto.lockToken);
  }

  @Get('bookings/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.booking.findOne(id, user.userId);
  }
}
