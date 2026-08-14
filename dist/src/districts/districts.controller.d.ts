import { DistrictsService } from './districts.service';
export declare class DistrictsController {
    private readonly districtsService;
    constructor(districtsService: DistrictsService);
    getDistricts(): Promise<import("./districts.service").DistrictItem[]>;
    getDistrictsByProvince(parentCode: string): Promise<import("./districts.service").DistrictItem[]>;
}
