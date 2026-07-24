import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { TenantService } from './tenant.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenant')
@Controller()
export class TenantController {
  constructor(private readonly tenants: TenantService) {}

  @Public()
  @Get('tenants/by-subdomain/:subdomain')
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenants.findBySubdomain(subdomain);
  }

  @Roles(UserRole.CINEMA_ADMIN, UserRole.SUPER_ADMIN)
  @Get('tenant/settings')
  getSettings(@CurrentUser() user: AuthUser) {
    return this.tenants.findById(user.tenantId!);
  }

  @Roles(UserRole.CINEMA_ADMIN, UserRole.SUPER_ADMIN)
  @Put('tenant/settings')
  updateSettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateTenantDto) {
    return this.tenants.update(user.tenantId!, dto);
  }
}
