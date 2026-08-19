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
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rooms_service_1 = require("./rooms.service");
const get_rooms_filter_dto_1 = require("./dto/get-rooms-filter.dto");
const create_room_dto_1 = require("./dto/create-room.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RoomsController = class RoomsController {
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    getRooms(filterDto) {
        return this.roomsService.getRooms(filterDto);
    }
    getMyRooms(req) {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.UnauthorizedException('Không tìm thấy thông tin xác thực');
        }
        return this.roomsService.getRooms({ userId: Number(userId) });
    }
    getRoomById(id) {
        return this.roomsService.getRoomById(id);
    }
    createRoom(dto, req) {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            throw new common_1.UnauthorizedException('Không thể xác thực thông tin người dùng');
        }
        return this.roomsService.createRoom(dto, Number(userId));
    }
    updateRoom(id, dto) {
        return this.roomsService.updateRoom(id, dto);
    }
    deleteRoom(id) {
        return this.roomsService.deleteRoom(id);
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách phòng trọ (Hỗ trợ lọc dữ liệu)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_rooms_filter_dto_1.GetRoomsFilterDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Get)('my-rooms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách bài đăng của tôi' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "getMyRooms", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin chi tiết 1 phòng trọ' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "getRoomById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo phòng trọ mới' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin phòng trọ' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "updateRoom", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa phòng trọ' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "deleteRoom", null);
exports.RoomsController = RoomsController = __decorate([
    (0, swagger_1.ApiTags)('Rooms'),
    (0, common_1.Controller)('api/rooms'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map