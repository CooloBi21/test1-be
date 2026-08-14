import { Pool } from 'pg';
export interface ProvinceRow {
    code: string;
    name: string;
}
export declare class ProvincesService {
    private readonly pool;
    constructor(pool: Pool);
    getAllProvinces(): Promise<ProvinceRow[]>;
}
