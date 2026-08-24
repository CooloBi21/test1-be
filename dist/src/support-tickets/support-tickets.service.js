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
exports.SupportTicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let SupportTicketsService = class SupportTicketsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createTicket(userId, category, message) {
        return this.prisma.support_tickets.create({
            data: { user_id: userId, category, message },
        });
    }
    async getUserTickets(userId) {
        return this.prisma.support_tickets.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
    }
    async getAdminTickets(status) {
        return this.prisma.support_tickets.findMany({
            where: status ? { status } : {},
            include: { user: { select: { id: true, full_name: true, email: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async replyTicket(id, admin_reply, status) {
        const ticket = await this.prisma.support_tickets.update({
            where: { id },
            data: { admin_reply, status },
        });
        await this.notificationsService.createNotification({
            user_id: ticket.user_id,
            type: 'system',
            title: 'Phản hồi khiếu nại/hỗ trợ',
            body: `Admin đã phản hồi ticket #${ticket.id} của bạn: "${admin_reply.substring(0, 40)}..."`,
            target_url: '/support',
            entity_type: 'ticket',
            entity_id: ticket.id,
        });
        return ticket;
    }
};
exports.SupportTicketsService = SupportTicketsService;
exports.SupportTicketsService = SupportTicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], SupportTicketsService);
//# sourceMappingURL=support-tickets.service.js.map