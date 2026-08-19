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
    if (!parentCode || parentCode === 'undefined') return [];

    const rawCode = String(parentCode).trim();
    const paddedCode = rawCode.padStart(2, '0');

    // Tìm kiếm cả hai định dạng ('1' và '01') để đảm bảo luôn khớp dữ liệu Supabase
    const possibleCodes = Array.from(new Set([rawCode, paddedCode]));

    const { data, error } = await this.db.supabase
      .from('districts')
      .select('*')
      .in('parent_code', possibleCodes)
      .order('name', { ascending: true });

    if (error) {
      console.error(`Lỗi truy vấn parent_code=${parentCode}:`, error);
      throw error;
    }

    return data || [];
  }
}