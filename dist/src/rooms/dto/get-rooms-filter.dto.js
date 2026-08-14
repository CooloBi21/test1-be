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
exports.GetRoomsFilterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GetRoomsFilterDto {
}
exports.GetRoomsFilterDto = GetRoomsFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mã tỉnh thành' }),
    __metadata("design:type", String)
], GetRoomsFilterDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mã quận huyện' }),
    __metadata("design:type", String)
], GetRoomsFilterDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Giá tối thiểu (VNĐ)' }),
    __metadata("design:type", String)
], GetRoomsFilterDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Giá tối đa (VNĐ)' }),
    __metadata("design:type", String)
], GetRoomsFilterDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Diện tích tối thiểu (m²)' }),
    __metadata("design:type", String)
], GetRoomsFilterDto.prototype, "minArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Diện tích tối đa (m²)' }),
    __metadata("design:type", String)
], GetRoomsFilterDto.prototype, "maxArea", void 0);
//# sourceMappingURL=get-rooms-filter.dto.js.map