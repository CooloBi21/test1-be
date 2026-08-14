import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

export interface ProvinceRow {
  code: string;
  name: string;
}

@Injectable()
export class ProvincesService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllProvinces(): Promise<ProvinceRow[]> {
    const result = await this.pool.query<ProvinceRow>(`
      SELECT code, name
      FROM provinces
      ORDER BY name
    `);
    return result.rows;
  }
}