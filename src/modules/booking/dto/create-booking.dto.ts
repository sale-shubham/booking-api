import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  showtimeId: string;

  @ApiProperty()
  @IsString()
  lockToken: string;
}
