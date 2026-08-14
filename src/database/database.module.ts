import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

export const DATABASE_POOL = 'DATABASE_POOL';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: DATABASE_POOL,
      useFactory: () => {
        return new Pool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: {
            rejectUnauthorized: false,
          },
        });
      },
    },
  ],
  exports: [DatabaseService, DATABASE_POOL], 
})
export class DatabaseModule {}