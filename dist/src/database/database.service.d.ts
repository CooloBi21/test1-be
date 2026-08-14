import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class DatabaseService {
    private configService;
    supabase: SupabaseClient;
    constructor(configService: ConfigService);
}
