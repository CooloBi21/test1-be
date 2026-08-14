import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService {
  public supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    // Kiểm tra nếu thiếu biến môi trường
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ CẢNH BÁO: Chưa cấu hình SUPABASE_URL hoặc SUPABASE_KEY trong file .env');
    }

    // Khởi tạo Supabase Client
    this.supabase = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseKey || 'placeholder-key',
    );
  }
}