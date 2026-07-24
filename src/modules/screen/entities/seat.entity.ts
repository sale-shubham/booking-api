import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Screen } from './screen.entity';

export enum SeatCategory {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  RECLINER = 'RECLINER',
}

@Entity('seats')
@Index(['screenId', 'row', 'col'], { unique: true })
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'screen_id' })
  screenId: string;

  @ManyToOne(() => Screen, (screen) => screen.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'screen_id' })
  screen: Screen;

  @Column()
  row: number;

  @Column()
  col: number;

  @Column({ type: 'enum', enum: SeatCategory, default: SeatCategory.SILVER })
  category: SeatCategory;
}
