import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@ApiTags('movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movies: MovieService) {}

  @Roles(UserRole.CINEMA_ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMovieDto) {
    return this.movies.create(user.tenantId!, dto);
  }

  @Public()
  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.movies.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movies.findOne(id);
  }

  @Roles(UserRole.CINEMA_ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateMovieDto) {
    return this.movies.update(id, user.tenantId!, dto);
  }

  @Roles(UserRole.CINEMA_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.movies.remove(id, user.tenantId!);
  }
}
