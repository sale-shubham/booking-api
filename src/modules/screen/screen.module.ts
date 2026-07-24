import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaModule } from '../cinema/cinema.module';
import { Screen } from './entities/screen.entity';
import { Seat } from './entities/seat.entity';
import { ScreenController } from './screen.controller';
import { ScreenService } from './screen.service';

@Module({
  imports: [TypeOrmModule.forFeature([Screen, Seat]), CinemaModule],
  controllers: [ScreenController],
  providers: [ScreenService],
  exports: [ScreenService],
})
export class ScreenModule {}
