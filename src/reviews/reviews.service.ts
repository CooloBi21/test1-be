import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async upsertReview(userId: number, roomId: number, rating: number, comment?: string) {
    return this.prisma.reviews.upsert({
      where: { user_id_room_id: { user_id: userId, room_id: roomId } },
      update: { rating, comment },
      create: { user_id: userId, room_id: roomId, rating, comment },
    });
  }

  async getMyReviews(userId: number) {
    return this.prisma.reviews.findMany({
      where: { user_id: userId },
      include: { room: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getReviewsAboutMe(userId: number) {
    return this.prisma.reviews.findMany({
      where: { room: { user_id: userId } },
      include: {
        user: { select: { full_name: true, avatar: true } },
        room: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async deleteReview(userId: number, reviewId: number) {
    return this.prisma.reviews.deleteMany({
      where: { id: reviewId, user_id: userId },
    });
  }
}