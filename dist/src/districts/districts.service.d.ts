import { DatabaseService } from '../database/database.service';
export interface DistrictItem {
    code?: string;
    name?: string;
    parent_code?: string;
    [key: string]: any;
}
export declare class DistrictsService {
    private readonly db;
    constructor(db: DatabaseService);
    getAllDistricts(): Promise<DistrictItem[]>;
    getDistrictsByProvince(parentCode: string): Promise<DistrictItem[]>;
}
