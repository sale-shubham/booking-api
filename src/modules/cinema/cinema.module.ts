import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { CinemaController } from './cinema.controller';
import { CinemaService } from './cinema.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema])],
  controllers: [CinemaController],
  providers: [CinemaService],
  exports: [CinemaService],
})
export class CinemaModule {}
