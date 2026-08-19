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
exports.RoomViewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoomViewsService = class RoomViewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordView(userId, roomId) {
        return this.prisma.room_views.create({
            data: { user_id: userId, room_id: roomId },
        });
    }
    async getViewHistory(userId) {
        return this.prisma.room_views.findMany({
            where: { user_id: userId },
            include: { room: true },
            orderBy: { viewed_at: 'desc' },
        });
    }
    async clearHistory(userId) {
        return this.prisma.room_views.deleteMany({ where: { user_id: userId } });
    }
    async removeHistoryItem(userId, roomId) {
        return this.prisma.room_views.deleteMany({
            where: { user_id: userId, room_id: roomId },
        });
    }
};
exports.RoomViewsService = RoomViewsService;
exports.RoomViewsService = RoomViewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomViewsService);
//# sourceMappingURL=room-views.service.js.map