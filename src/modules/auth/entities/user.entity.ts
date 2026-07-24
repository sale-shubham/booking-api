import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CINEMA_ADMIN = 'cinema_admin',
  ATTENDEE = 'attendee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ATTENDEE })
  role: UserRole;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  // Shared fields for all 4 login-methods (only email_password is wired for MVP)
  @Index({ unique: true, where: '"username" IS NOT NULL' })
  @Column({ type: 'text', nullable: true })
  username: string | null;

  @Index({ unique: true, where: '"email" IS NOT NULL' })
  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Index({ unique: true, where: '"phone" IS NOT NULL' })
  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash: string | null;

  @Column({ name: 'otp_code', type: 'text', nullable: true })
  otpCode: string | null;

  @Column({ name: 'otp_expires_at', type: 'timestamptz', nullable: true })
  otpExpiresAt: Date | null;

  @Column({ name: 'otp_attempts', default: 0 })
  otpAttempts: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
