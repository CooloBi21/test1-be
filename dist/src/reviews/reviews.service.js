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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ReviewsService = class ReviewsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async upsertReview(userId, roomId, rating, comment) {
        const review = await this.prisma.reviews.upsert({
            where: { user_id_room_id: { user_id: userId, room_id: roomId } },
            update: { rating, comment },
            create: { user_id: userId, room_id: roomId, rating, comment },
            include: { room: true, user: { select: { full_name: true } } },
        });
        if (review.room && review.room.user_id && review.room.user_id !== userId) {
            await this.notificationsService.createNotification({
                user_id: review.room.user_id,
                type: 'room_reviewed',
                title: 'Có đánh giá mới về phòng',
                body: `${review.user?.full_name || 'Một người dùng'} đã đánh giá ${rating} sao cho phòng "${review.room.title}"`,
                target_url: `/rooms/${roomId}`,
                entity_type: 'room',
                entity_id: roomId,
            });
        }
        return review;
    }
    async getMyReviews(userId) {
        return this.prisma.reviews.findMany({
            where: { user_id: userId },
            include: { room: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async getReviewsAboutMe(userId) {
        return this.prisma.reviews.findMany({
            where: { room: { user_id: userId } },
            include: {
                user: { select: { full_name: true, avatar: true } },
                room: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async deleteReview(userId, reviewId) {
        return this.prisma.reviews.deleteMany({
            where: { id: reviewId, user_id: userId },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map