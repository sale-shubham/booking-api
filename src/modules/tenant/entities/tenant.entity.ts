import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ name: 'plan_id', default: 'free' })
  planId: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
