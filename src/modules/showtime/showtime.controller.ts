import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';

@ApiTags('showtimes')
@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimes: ShowtimeService) {}

  @Roles(UserRole.CINEMA_ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateShowtimeDto) {
    return this.showtimes.create(user.tenantId!, dto);
  }

  @Public()
  @Get()
  findAll(@Query('movieId') movieId?: string, @Query('screenId') screenId?: string) {
    return this.showtimes.findAll({ movieId, screenId });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showtimes.findOne(id);
  }

  @Roles(UserRole.CINEMA_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.showtimes.remove(id, user.tenantId!);
  }
}
