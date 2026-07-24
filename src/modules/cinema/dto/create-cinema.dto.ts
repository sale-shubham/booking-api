import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCinemaDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  address: string;
}
