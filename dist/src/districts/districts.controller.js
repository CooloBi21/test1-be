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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistrictsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const districts_service_1 = require("./districts.service");
let DistrictsController = class DistrictsController {
    constructor(districtsService) {
        this.districtsService = districtsService;
    }
    getDistricts() {
        return this.districtsService.getAllDistricts();
    }
    getDistrictsByProvince(parentCode) {
        if (!parentCode) {
            throw new common_1.BadRequestException('parentCode là bắt buộc');
        }
        return this.districtsService.getDistrictsByProvince(parentCode);
    }
};
exports.DistrictsController = DistrictsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả Quận / Huyện' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DistrictsController.prototype, "getDistricts", null);
__decorate([
    (0, common_1.Get)('by-province'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách Quận / Huyện theo Tỉnh / Thành' }),
    (0, swagger_1.ApiQuery)({ name: 'parentCode', required: true, description: 'Mã tỉnh/thành' }),
    __param(0, (0, common_1.Query)('parentCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistrictsController.prototype, "getDistrictsByProvince", null);
exports.DistrictsController = DistrictsController = __decorate([
    (0, swagger_1.ApiTags)('Locations'),
    (0, common_1.Controller)('api/districts'),
    __metadata("design:paramtypes", [districts_service_1.DistrictsService])
], DistrictsController);
//# sourceMappingURL=districts.controller.js.map