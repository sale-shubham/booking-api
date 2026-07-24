import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { Seat } from './seat.entity';

@Entity('screens')
export class Screen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cinema_id' })
  cinemaId: string;

  @ManyToOne(() => Cinema, (cinema) => cinema.screens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cinema_id' })
  cinema: Cinema;

  @Column()
  name: string;

  @Column({ name: 'total_rows' })
  totalRows: number;

  @Column({ name: 'total_cols' })
  totalCols: number;

  @OneToMany(() => Seat, (seat) => seat.screen)
  seats: Seat[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
