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
    const viewerId = Number.isFinite(options.viewerId)
      ? Number(options.viewerId)
      : 0;

    const orderBy =
      sort === 'rating_desc'
        ? [
            { rating: 'desc' as const },
            { created_at: 'desc' as const },
          ]
        : sort === 'rating_asc'
          ? [
              { rating: 'asc' as const },
              { created_at: 'desc' as const },
            ]
          : {
              created_at: 'desc' as const,
            };

    const reviews = await this.prisma.reviews.findMany({
      where: {
        room_id: roomId,
      },
      select: {
        id: true,
        user_id: true,
        room_id: true,
        rating: true,
        comment: true,
        owner_reply: true,
        owner_reply_at: true,
        created_at: true,
        updated_at: true,

        user: {
          select: {
            id: true,
            full_name: true,
            avatar: true,
          },
        },

        reactions: {
          select: {
            user_id: true,
            reaction_type: true,
          },
        },
      },
      orderBy,
    });

    if (reviews.length === 0) {
      return [];
    }

    const reviewerIds = [
      ...new Set(reviews.map((review) => review.user_id)),
    ];

    const [roomViews, conversations] = await Promise.all([
      this.prisma.room_views.findMany({
        where: {
          room_id: roomId,
          user_id: {
            in: reviewerIds,
          },
        },
        select: {
          user_id: true,
        },
      }),

      this.prisma.conversations.findMany({
        where: {
          room_id: roomId,
          OR: [
            {
              user_1_id: {
                in: reviewerIds,
              },
            },
            {
              user_2_id: {
                in: reviewerIds,
              },
            },
          ],
        },
        select: {
          user_1_id: true,
          user_2_id: true,
        },
      }),
    ]);

    const verifiedUserIds = new Set<number>();

    for (const view of roomViews) {
      verifiedUserIds.add(view.user_id);
    }

    for (const conversation of conversations) {
      if (reviewerIds.includes(conversation.user_1_id)) {
        verifiedUserIds.add(conversation.user_1_id);
      }

      if (reviewerIds.includes(conversation.user_2_id)) {
        verifiedUserIds.add(conversation.user_2_id);
      }
    }

    return reviews.map((review) => {
      const reactions = review.reactions.reduce(
        (acc, reaction) => {
          acc[reaction.reaction_type] =
            (acc[reaction.reaction_type] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>,
      );

      const currentUserReactions =
        viewerId > 0
          ? review.reactions
              .filter((reaction) => reaction.user_id === viewerId)
              .map((reaction) => reaction.reaction_type)
          : [];

      return {
        id: review.id,
        user_id: review.user_id,
        room_id: review.room_id,
        rating: review.rating,
        comment: review.comment,

        // Preserve the existing API response.
        images: [],

        owner_reply: review.owner_reply,
        owner_reply_at: review.owner_reply_at,
        created_at: review.created_at,
        updated_at: review.updated_at,

        reactions,
        current_user_reactions: currentUserReactions,

        user: review.user,

        verified_interaction: verifiedUserIds.has(review.user_id),
      };
    });
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
