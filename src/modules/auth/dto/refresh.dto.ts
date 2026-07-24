import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({ description: 'Only needed if the refresh cookie is unavailable (e.g. non-browser client)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
