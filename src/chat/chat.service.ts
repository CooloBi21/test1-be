import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách cuộc trò chuyện của user đăng nhập
  async getConversations(userId: number) {
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

  // Đếm tổng số tin nhắn CHƯA ĐỌC gửi tới user này
  async getUnreadCount(userId: number) {
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

  // Lấy danh sách tin nhắn theo cuộc trò chuyện
  async getMessages(conversationId: number) {
    return this.prisma.messages.findMany({
      where: { conversation_id: conversationId },
      include: {
        sender: { select: { id: true, full_name: true, avatar: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // Tạo mới hoặc lấy phòng chat đã tồn tại giữa 2 user
  async createOrGetConversation(user1Id: number, user2Id: number, roomId?: number) {
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

  // Lưu tin nhắn mới vào database
  async saveMessage(conversationId: number, senderId: number, text: string) {
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

    // Cập nhật thời gian updated_at của cuộc trò chuyện
    await this.prisma.conversations.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });

    return message;
  }

  // Đánh dấu toàn bộ tin nhắn trong phòng chat này là ĐÃ ĐỌC
  async markAsRead(conversationId: number, userId: number) {
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
}