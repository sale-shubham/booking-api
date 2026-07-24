import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movie/entities/movie.entity';
import { Screen } from '../../screen/entities/screen.entity';

@Entity('showtimes')
export class Showtime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'movie_id' })
  movieId: string;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column({ name: 'screen_id' })
  screenId: string;

  @ManyToOne(() => Screen, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'screen_id' })
  screen: Screen;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  /** e.g. { "SILVER": 150, "GOLD": 250, "RECLINER": 400 } — price per SeatCategory, in the tenant's currency minor unit */
  @Column({ name: 'price_by_category', type: 'jsonb' })
  priceByCategory: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
