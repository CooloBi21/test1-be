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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(userId) {
        const conversations = await this.prisma.conversations.findMany({
            where: {
                OR: [{ user_1_id: userId }, { user_2_id: userId }],
            },
            include: {
                user1: { select: { id: true, full_name: true, avatar: true } },
                user2: { select: { id: true, full_name: true, avatar: true } },
                room: { select: { id: true, title: true, thumbnail: true } },
                messages: {
                    take: 1,
                    orderBy: { created_at: 'desc' },
                },
            },
            orderBy: { updated_at: 'desc' },
        });
        return conversations;
    }
    async getUnreadCount(userId) {
        return this.prisma.messages.count({
            where: {
                is_read: false,
                sender_id: { not: userId },
                conversation: {
                    OR: [{ user_1_id: userId }, { user_2_id: userId }],
                },
            },
        });
    }
    async getMessages(conversationId) {
        return this.prisma.messages.findMany({
            where: { conversation_id: conversationId },
            include: {
                sender: { select: { id: true, full_name: true, avatar: true } },
            },
            orderBy: { created_at: 'asc' },
        });
    }
    async createOrGetConversation(user1Id, user2Id, roomId) {
        if (user1Id === user2Id) {
            throw new Error('Không thể nhắn tin với chính mình');
        }
        let conversation = await this.prisma.conversations.findFirst({
            where: {
                OR: [
                    { user_1_id: user1Id, user_2_id: user2Id, room_id: roomId || null },
                    { user_1_id: user2Id, user_2_id: user1Id, room_id: roomId || null },
                ],
            },
        });
        if (!conversation) {
            conversation = await this.prisma.conversations.create({
                data: {
                    user_1_id: user1Id,
                    user_2_id: user2Id,
                    room_id: roomId || null,
                },
            });
        }
        return conversation;
    }
    async saveMessage(conversationId, senderId, text) {
        const message = await this.prisma.messages.create({
            data: {
                conversation_id: conversationId,
                sender_id: senderId,
                text,
            },
            include: {
                sender: { select: { id: true, full_name: true, avatar: true } },
            },
        });
        await this.prisma.conversations.update({
            where: { id: conversationId },
            data: { updated_at: new Date() },
        });
        return message;
    }
    async markAsRead(conversationId, userId) {
        await this.prisma.messages.updateMany({
            where: {
                conversation_id: conversationId,
                sender_id: { not: userId },
                is_read: false,
            },
            data: { is_read: true },
        });
        return { success: true };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map