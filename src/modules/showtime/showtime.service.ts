import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieService } from '../movie/movie.service';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime) private readonly showtimes: Repository<Showtime>,
    private readonly movies: MovieService,
  ) {}

  async create(tenantId: string, dto: CreateShowtimeDto) {
    const movie = await this.movies.findOne(dto.movieId);
    if (movie.tenantId !== tenantId) {
      throw new ForbiddenException('Movie does not belong to your tenant');
    }
    return this.showtimes.save(
      this.showtimes.create({
        movieId: dto.movieId,
        screenId: dto.screenId,
        startTime: new Date(dto.startTime),
        priceByCategory: dto.priceByCategory,
      }),
    );
  }

  findAll(filters: { movieId?: string; screenId?: string }) {
    return this.showtimes.find({
      where: {
        ...(filters.movieId ? { movieId: filters.movieId } : {}),
        ...(filters.screenId ? { screenId: filters.screenId } : {}),
      },
      relations: { screen: { cinema: true } },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: string) {
    const showtime = await this.showtimes.findOne({
      where: { id },
      relations: { screen: { cinema: true } },
    });
    if (!showtime) {
      throw new NotFoundException('Showtime not found');
    }
    return showtime;
  }

  async remove(id: string, tenantId: string) {
    const showtime = await this.findOne(id);
    const movie = await this.movies.findOne(showtime.movieId);
    if (movie.tenantId !== tenantId) {
      throw new ForbiddenException('Showtime does not belong to your tenant');
    }
    await this.showtimes.remove(showtime);
    return { success: true };
  }
}
