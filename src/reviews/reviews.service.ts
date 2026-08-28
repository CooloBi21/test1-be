import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

type ReviewQueryOptions = {
  sort?: string;
  filter?: string;
  viewerId?: number;
};

const REVIEW_REACTION_TYPES = new Set(['helpful', 'like', 'trusted', 'love']);

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
      include: {
        room: true,
        user: { select: { full_name: true } },
      },
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
    const viewerId = Number.isFinite(options.viewerId) ? Number(options.viewerId) : 0;

    const orderClause =
      sort === 'rating_desc'
        ? 'r.rating DESC, r.created_at DESC'
        : sort === 'rating_asc'
          ? 'r.rating ASC, r.created_at DESC'
          : 'r.created_at DESC';

    return this.prisma.$queryRawUnsafe(
      `
      SELECT
        r.id,
        r.user_id,
        r.room_id,
        r.rating,
        r.comment,
        '[]'::jsonb AS images,
        r.owner_reply,
        r.owner_reply_at,
        r.created_at,
        r.updated_at,
        (
          SELECT COALESCE(jsonb_object_agg(reaction_type, reaction_count), '{}'::jsonb)
          FROM (
            SELECT reaction_type, COUNT(*)::int AS reaction_count
            FROM review_reactions rr
            WHERE rr.review_id = r.id
            GROUP BY reaction_type
          ) reaction_counts
        ) AS reactions,
        (
          SELECT COALESCE(jsonb_agg(rr_me.reaction_type), '[]'::jsonb)
          FROM review_reactions rr_me
          WHERE rr_me.review_id = r.id
            AND rr_me.user_id = $2
        ) AS current_user_reactions,
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
      ORDER BY ${orderClause}
      `,
      roomId,
      viewerId,
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

    const updatedReview = await this.prisma.reviews.update({
      where: { id: reviewId },
      data: {
        owner_reply: trimmedReply,
        owner_reply_at: new Date(),
      },
    });

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

    return updatedReview;
  }

  async toggleReaction(userId: number, reviewId: number, reactionType: string) {
    const normalizedType = String(reactionType || '').trim().toLowerCase();
    if (!REVIEW_REACTION_TYPES.has(normalizedType)) {
      throw new BadRequestException('Loại cảm xúc không hợp lệ');
    }

    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    const existing = await this.prisma.review_reactions.findFirst({
      where: {
        review_id: reviewId,
        user_id: userId,
      },
    });

    let isActive = false;

    if (existing) {
      if (existing.reaction_type === normalizedType) {
        await this.prisma.review_reactions.delete({
          where: { id: existing.id },
        });
        isActive = false;
      } else {
        await this.prisma.review_reactions.update({
          where: { id: existing.id },
          data: { reaction_type: normalizedType },
        });
        isActive = true;
      }
    } else {
      await this.prisma.review_reactions.create({
        data: {
          review_id: reviewId,
          user_id: userId,
          reaction_type: normalizedType,
        },
      });
      isActive = true;
    }

    const counts = await this.prisma.review_reactions.groupBy({
      by: ['reaction_type'],
      where: { review_id: reviewId },
      _count: { reaction_type: true },
    });

    const reactions = counts.reduce((acc, item) => {
      acc[item.reaction_type] = item._count.reaction_type;
      return acc;
    }, {} as Record<string, number>);

    return {
      review_id: reviewId,
      type: normalizedType,
      active: isActive,
      reactions,
    };
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
