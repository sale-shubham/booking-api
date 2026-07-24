import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CinemaService } from '../cinema/cinema.service';
import { Screen } from './entities/screen.entity';
import { Seat, SeatCategory } from './entities/seat.entity';
import { CreateScreenDto } from './dto/create-screen.dto';

@Injectable()
export class ScreenService {
  constructor(
    @InjectRepository(Screen) private readonly screens: Repository<Screen>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
    private readonly cinemas: CinemaService,
  ) {}

  async create(cinemaId: string, tenantId: string, dto: CreateScreenDto) {
    const cinema = await this.cinemas.findOne(cinemaId);
    if (cinema.tenantId !== tenantId) {
      throw new NotFoundException('Cinema not found');
    }

    const screen = await this.screens.save(
      this.screens.create({
        cinemaId,
        name: dto.name,
        totalRows: dto.totalRows,
        totalCols: dto.totalCols,
      }),
    );

    const seatRows: Seat[] = [];
    for (let row = 1; row <= dto.totalRows; row++) {
      const category = dto.rowCategories?.[row - 1] ?? SeatCategory.SILVER;
      for (let col = 1; col <= dto.totalCols; col++) {
        seatRows.push(this.seats.create({ screenId: screen.id, row, col, category }));
      }
    }
    await this.seats.save(seatRows);

    return this.findOne(screen.id);
  }

  findAllForCinema(cinemaId: string) {
    return this.screens.find({ where: { cinemaId } });
  }

  async findOne(id: string) {
    const screen = await this.screens.findOne({ where: { id }, relations: { seats: true } });
    if (!screen) {
      throw new NotFoundException('Screen not found');
    }
    return screen;
  }

  async getSeats(screenId: string) {
    await this.findOne(screenId);
    return this.seats.find({ where: { screenId }, order: { row: 'ASC', col: 'ASC' } });
  }
}
