import { ProvincesService } from './provinces.service';
export declare class ProvincesController {
    private readonly provincesService;
    constructor(provincesService: ProvincesService);
    getProvinces(): Promise<import("./provinces.service").ProvinceRow[]>;
}
