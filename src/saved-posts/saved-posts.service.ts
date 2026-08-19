import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedPostsService {
  constructor(private prisma: PrismaService) {}

  async toggleSave(userId: number, roomId: number) {
    const existing = await this.prisma.saved_posts.findUnique({
      where: { user_id_room_id: { user_id: userId, room_id: roomId } },
    });

    if (existing) {
      await this.prisma.saved_posts.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    await this.prisma.saved_posts.create({
      data: { user_id: userId, room_id: roomId },
    });
    return { saved: true };
  }

  async checkSaved(userId: number, roomId: number) {
    const item = await this.prisma.saved_posts.findUnique({
      where: { user_id_room_id: { user_id: userId, room_id: roomId } },
    });
    return !!item;
  }

  async getUserSavedPosts(userId: number) {
    return this.prisma.saved_posts.findMany({
      where: { user_id: userId },
      include: { room: true },
      orderBy: { created_at: 'desc' },
    });
  }
}