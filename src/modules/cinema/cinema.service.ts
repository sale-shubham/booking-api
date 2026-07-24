import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cinema } from './entities/cinema.entity';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

@Injectable()
export class CinemaService {
  constructor(@InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>) {}

  create(tenantId: string, dto: CreateCinemaDto) {
    return this.cinemas.save(this.cinemas.create({ ...dto, tenantId }));
  }

  findAll(tenantId: string) {
    return this.cinemas.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const cinema = await this.cinemas.findOne({ where: { id } });
    if (!cinema) {
      throw new NotFoundException('Cinema not found');
    }
    return cinema;
  }

  async update(id: string, tenantId: string, dto: UpdateCinemaDto) {
    const cinema = await this.findOne(id);
    this.assertOwnership(cinema, tenantId);
    Object.assign(cinema, dto);
    return this.cinemas.save(cinema);
  }

  async remove(id: string, tenantId: string) {
    const cinema = await this.findOne(id);
    this.assertOwnership(cinema, tenantId);
    await this.cinemas.remove(cinema);
    return { success: true };
  }

  private assertOwnership(cinema: Cinema, tenantId: string) {
    if (cinema.tenantId !== tenantId) {
      throw new ForbiddenException('Cinema does not belong to your tenant');
    }
  }
}
