import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SeatCategory } from '../entities/seat.entity';

export class CreateScreenDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  totalRows: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  totalCols: number;

  @ApiPropertyOptional({
    description: 'Seat category per row (index 0 = row 1). Defaults to SILVER for unspecified rows.',
    enum: SeatCategory,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  rowCategories?: SeatCategory[];
}
