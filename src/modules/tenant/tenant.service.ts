import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(@InjectRepository(Tenant) private readonly tenants: Repository<Tenant>) {}

  async findById(id: string) {
    const tenant = await this.tenants.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findBySubdomain(subdomain: string) {
    const tenant = await this.tenants.findOne({ where: { subdomain } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.findById(id);
    Object.assign(tenant, dto);
    return this.tenants.save(tenant);
  }
}
