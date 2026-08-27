import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

type ReviewQueryOptions = {
  sort?: string;
  filter?: string;
};

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

  async getRoomReviews(roomId: number, options: ReviewQueryOptions = {}) {
    const sort = options.sort || 'latest';
    const filter = options.filter || 'all';

    const orderClause =
      sort === 'rating_desc'
        ? 'r.rating DESC, r.created_at DESC'
        : sort === 'rating_asc'
          ? 'r.rating ASC, r.created_at DESC'
          : 'r.created_at DESC';

    const filterClause =
      filter === 'with_reply'
        ? 'AND NULLIF(BTRIM(COALESCE(r.owner_reply, \'\')), \'\') IS NOT NULL'
        : '';

    return this.prisma.$queryRawUnsafe(
      `
      SELECT
        r.id,
        r.user_id,
        r.room_id,
        r.rating,
        r.comment,
        r.owner_reply,
        r.owner_reply_at,
        r.created_at,
        r.updated_at,
        json_build_object(
          'id', u.id,
          'full_name', u.full_name,
          'avatar', u.avatar
        ) AS user,
        EXISTS (
          SELECT 1
          FROM room_views rv
          WHERE rv.room_id = r.room_id
            AND rv.user_id = r.user_id
        ) OR EXISTS (
          SELECT 1
          FROM conversations c
          WHERE c.room_id = r.room_id
            AND (c.user_1_id = r.user_id OR c.user_2_id = r.user_id)
        ) AS verified_interaction
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.room_id = $1
      ${filterClause}
      ORDER BY ${orderClause}
      `,
      roomId,
    );
  }

  async replyAsOwner(ownerId: number, reviewId: number, reply: string) {
    const trimmedReply = String(reply || '').trim();
    if (!trimmedReply) {
      throw new BadRequestException('Nội dung phản hồi không được để trống');
    }

    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
      include: {
        room: true,
        user: { select: { id: true } },
      },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    if (review.room?.user_id !== ownerId) {
      throw new ForbiddenException('Chỉ chủ bài đăng mới có quyền phản hồi đánh giá này');
    }

    const updatedRows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      UPDATE reviews
      SET owner_reply = $1, owner_reply_at = now()
      WHERE id = $2
      RETURNING
        id,
        user_id,
        room_id,
        rating,
        comment,
        owner_reply,
        owner_reply_at,
        created_at,
        updated_at
      `,
      trimmedReply,
      reviewId,
    );

    if (review.user_id !== ownerId) {
      await this.notificationsService.createNotification({
        user_id: review.user_id,
        type: 'review_owner_reply',
        title: 'Chủ nhà đã phản hồi đánh giá của bạn',
        body: `Chủ bài đăng đã phản hồi đánh giá của bạn về phòng "${review.room.title}"`,
        target_url: `/rooms/${review.room_id}`,
        entity_type: 'review',
        entity_id: reviewId,
      });
    }

    return updatedRows[0];
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
