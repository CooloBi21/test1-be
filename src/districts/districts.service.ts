import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface DistrictItem {
  code?: string;
  name?: string;
  parent_code?: string;
  [key: string]: any;
}

@Injectable()
export class DistrictsService {
  constructor(private readonly db: DatabaseService) {}

  // Lấy tất cả Quận / Huyện từ Supabase
  async getAllDistricts(): Promise<DistrictItem[]> {
    const { data, error } = await this.db.supabase
      .from('districts')
      .select('*');

    if (error) {
      console.error('Lỗi lấy danh sách quận huyện:', error);
      throw error;
    }

    return data || [];
  }

  // Lọc Quận / Huyện theo parent_code từ Supabase
  async getDistrictsByProvince(parentCode: string): Promise<DistrictItem[]> {
    // Tự động thêm số 0 ở đầu nếu truyền vào '1' -> biến thành '01' cho khớp DB
    const formattedCode = String(parentCode).padStart(2, '0');

    const { data, error } = await this.db.supabase
      .from('districts')
      .select('*')
      .eq('parent_code', formattedCode);

    if (error) {
      console.error(`Lỗi truy vấn parent_code=${formattedCode}:`, error);
      throw error;
    }

    return data || [];
  }
}