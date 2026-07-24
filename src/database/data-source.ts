import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ENTITIES } from './database.module';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ENTITIES,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});
