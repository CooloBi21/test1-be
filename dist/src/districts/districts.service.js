"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistrictsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let DistrictsService = class DistrictsService {
    constructor(db) {
        this.db = db;
    }
    async getAllDistricts() {
        const { data, error } = await this.db.supabase
            .from('districts')
            .select('*');
        if (error) {
            console.error('Lỗi lấy danh sách quận huyện:', error);
            throw error;
        }
        return data || [];
    }
    async getDistrictsByProvince(parentCode) {
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
};
exports.DistrictsService = DistrictsService;
exports.DistrictsService = DistrictsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DistrictsService);
//# sourceMappingURL=districts.service.js.map