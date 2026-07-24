import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(@InjectRepository(Movie) private readonly movies: Repository<Movie>) {}

  create(tenantId: string, dto: CreateMovieDto) {
    return this.movies.save(this.movies.create({ ...dto, tenantId }));
  }

  findAll(tenantId: string) {
    return this.movies.find({ where: { tenantId }, order: { title: 'ASC' } });
  }

  async findOne(id: string) {
    const movie = await this.movies.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async update(id: string, tenantId: string, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    this.assertOwnership(movie, tenantId);
    Object.assign(movie, dto);
    return this.movies.save(movie);
  }

  async remove(id: string, tenantId: string) {
    const movie = await this.findOne(id);
    this.assertOwnership(movie, tenantId);
    await this.movies.remove(movie);
    return { success: true };
  }

  private assertOwnership(movie: Movie, tenantId: string) {
    if (movie.tenantId !== tenantId) {
      throw new ForbiddenException('Movie does not belong to your tenant');
    }
  }
}
