import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomViewsService {
  constructor(private prisma: PrismaService) {}

  async recordView(userId: number, roomId: number) {
    return this.prisma.room_views.create({
      data: { user_id: userId, room_id: roomId },
    });
  }

  async getViewHistory(userId: number) {
    return this.prisma.room_views.findMany({
      where: { user_id: userId },
      include: { room: true },
      orderBy: { viewed_at: 'desc' },
    });
  }

  async clearHistory(userId: number) {
    return this.prisma.room_views.deleteMany({ where: { user_id: userId } });
  }

  async removeHistoryItem(userId: number, roomId: number) {
    return this.prisma.room_views.deleteMany({
      where: { user_id: userId, room_id: roomId },
    });
  }
}