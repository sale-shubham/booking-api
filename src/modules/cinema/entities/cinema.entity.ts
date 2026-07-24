import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Screen } from '../../screen/entities/screen.entity';

@Entity('cinemas')
export class Cinema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @OneToMany(() => Screen, (screen) => screen.cinema)
  screens: Screen[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
