import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async upsertReview(userId: number, roomId: number, rating: number, comment?: string) {
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