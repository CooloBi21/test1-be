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
          connectionString: process.env.DATABASE_URL,
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