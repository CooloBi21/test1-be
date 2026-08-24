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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReport(reporterId, dto) {
        const room = await this.prisma.rooms.findUnique({ where: { id: dto.room_id } });
        if (!room)
            throw new common_1.NotFoundException('Phòng trọ không tồn tại');
        return this.prisma.reports.create({
            data: {
                room_id: dto.room_id,
                reporter_id: reporterId,
                reason: dto.reason,
            },
        });
    }
    async getAllReportsForAdmin() {
        return this.prisma.reports.findMany({
            include: {
                room: { select: { id: true, title: true } },
                reporter: { select: { id: true, full_name: true, email: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async updateReportStatus(reportId, status) {
        const report = await this.prisma.reports.findUnique({ where: { id: reportId } });
        if (!report)
            throw new common_1.NotFoundException('Không tìm thấy báo cáo');
        return this.prisma.reports.update({
            where: { id: reportId },
            data: { status },
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map