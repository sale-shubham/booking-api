import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ScreenService } from './screen.service';
import { CreateScreenDto } from './dto/create-screen.dto';

@ApiTags('screens')
@Controller()
export class ScreenController {
  constructor(private readonly screens: ScreenService) {}

  @Roles(UserRole.CINEMA_ADMIN)
  @Post('cinemas/:cinemaId/screens')
  create(
    @Param('cinemaId') cinemaId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateScreenDto,
  ) {
    return this.screens.create(cinemaId, user.tenantId!, dto);
  }

  @Public()
  @Get('cinemas/:cinemaId/screens')
  findAllForCinema(@Param('cinemaId') cinemaId: string) {
    return this.screens.findAllForCinema(cinemaId);
  }

  @Public()
  @Get('screens/:id')
  findOne(@Param('id') id: string) {
    return this.screens.findOne(id);
  }

  @Public()
  @Get('screens/:id/seats')
  getSeats(@Param('id') id: string) {
    return this.screens.getSeats(id);
  }
}
