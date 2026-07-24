import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class SignupTenantDto {
  @ApiProperty({ description: 'Cinema chain display name' })
  @IsString()
  tenantName: string;

  @ApiProperty({ description: 'Lowercase, url-safe subdomain, e.g. "pvr"' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'subdomain must be lowercase letters, numbers, hyphens only' })
  subdomain: string;

  @ApiProperty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  adminPassword: string;
}
