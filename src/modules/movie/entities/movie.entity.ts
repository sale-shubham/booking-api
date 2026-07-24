import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_min' })
  durationMin: number;

  @Column()
  language: string;

  @Column({ name: 'poster_url', type: 'text', nullable: true })
  posterUrl: string | null;

  @Column({ type: 'float', nullable: true })
  rating: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
