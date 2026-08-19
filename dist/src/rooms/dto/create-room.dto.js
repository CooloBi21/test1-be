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
exports.CreateRoomDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateRoomDto {
}
exports.CreateRoomDto = CreateRoomDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tiêu đề phòng trọ' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tiêu đề không được để trống' }),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ảnh đại diện' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "thumbnail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giá phòng (VNĐ)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Giá phòng không được để trống' }),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Diện tích (m²)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Diện tích không được để trống' }),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã tỉnh thành' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mã tỉnh thành không được để trống' }),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã quận huyện' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mã quận huyện không được để trống' }),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nội dung chi tiết' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "content", void 0);
//# sourceMappingURL=create-room.dto.js.map