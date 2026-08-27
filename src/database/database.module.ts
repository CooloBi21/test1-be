import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pool, types } from 'pg';
import { DatabaseService } from './database.service';

export const DATABASE_POOL = 'DATABASE_POOL';

// Keep Postgres `timestamp without time zone` values as raw strings.
// node-postgres otherwise interprets them as local Date objects, which shifts
// UTC timestamps before the frontend can format them as Vietnam time.
types.setTypeParser(1114, (value) => value);

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: DATABASE_POOL,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          });
        }

        return new Pool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT) || 5432,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          ssl: { rejectUnauthorized: false },
        });
      },
    },
  ],
  exports: [DatabaseService, DATABASE_POOL],
})
export class DatabaseModule {}
