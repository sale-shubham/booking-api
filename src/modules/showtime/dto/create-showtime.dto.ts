import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsObject, IsUUID } from 'class-validator';

export class CreateShowtimeDto {
  @ApiProperty()
  @IsUUID()
  movieId: string;

  @ApiProperty()
  @IsUUID()
  screenId: string;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Price per seat category, e.g. { "SILVER": 150, "GOLD": 250, "RECLINER": 400 }',
  })
  @IsObject()
  priceByCategory: Record<string, number>;
}
