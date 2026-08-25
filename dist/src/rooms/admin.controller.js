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
exports.AdminController = exports.UpdateRoomStatusDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const rooms_service_1 = require("../rooms/rooms.service");
class UpdateRoomStatusDto {
}
exports.UpdateRoomStatusDto = UpdateRoomStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'approved',
        enum: ['approved', 'rejected'],
        description: 'Trạng thái mới của bài đăng',
    }),
    __metadata("design:type", String)
], UpdateRoomStatusDto.prototype, "status", void 0);
let AdminController = class AdminController {
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    async getAllRoomsForAdmin() {
        return await this.roomsService.findAllForAdmin();
    }
    async updateRoomStatus(id, status) {
        const validStatuses = ['approved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            throw new common_1.BadRequestException('Status không hợp lệ. Chỉ chấp nhận approved hoặc rejected');
        }
        return this.roomsService.updateRoomStatus(id, status);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('rooms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllRoomsForAdmin", null);
__decorate([
    (0, common_1.Put)('rooms/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBody)({ type: UpdateRoomStatusDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateRoomStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map