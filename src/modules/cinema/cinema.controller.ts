import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CinemaService } from './cinema.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@ApiTags('cinemas')
@Controller('cinemas')
export class CinemaController {
  constructor(private readonly cinemas: CinemaService) {}

  @Roles(UserRole.CINEMA_ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCinemaDto) {
    return this.cinemas.create(user.tenantId!, dto);
  }

  @Public()
  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.cinemas.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cinemas.findOne(id);
  }

  @Roles(UserRole.CINEMA_ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateCinemaDto) {
    return this.cinemas.update(id, user.tenantId!, dto);
  }

  @Roles(UserRole.CINEMA_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.cinemas.remove(id, user.tenantId!);
  }
}
