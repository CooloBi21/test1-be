import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockPrisma = {
    reviews: {
      findMany: jest.fn(),
    },
    room_views: {
      findMany: jest.fn(),
    },
    conversations: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();

    service = new ReviewsService(
      mockPrisma as any,
      mockNotificationsService as any,
    );
  });

  describe('getRoomReviews', () => {
    it('should return room reviews with default sorting', async () => {
      const mockDbReviews = [
        {
          id: 1,
          user_id: 10,
          room_id: 123,
          rating: 5,
          comment: 'Phòng tốt',
          owner_reply: null,
          owner_reply_at: null,
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-01'),
          user: { id: 10, full_name: 'User 10', avatar: null },
          reactions: [],
        },
        {
          id: 2,
          user_id: 20,
          room_id: 123,
          rating: 4,
          comment: 'Khá tốt',
          owner_reply: null,
          owner_reply_at: null,
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-01'),
          user: { id: 20, full_name: 'User 20', avatar: null },
          reactions: [],
        },
      ];

      mockPrisma.reviews.findMany.mockResolvedValueOnce(mockDbReviews);
      mockPrisma.room_views.findMany.mockResolvedValueOnce([]);
      mockPrisma.conversations.findMany.mockResolvedValueOnce([]);

      const result = await service.getRoomReviews(123);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);

      expect(mockPrisma.reviews.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.reviews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { room_id: 123 },
          orderBy: { created_at: 'desc' },
        }),
      );
    });

    it('should use rating_desc sorting', async () => {
      mockPrisma.reviews.findMany.mockResolvedValueOnce([]);
      mockPrisma.room_views.findMany.mockResolvedValueOnce([]);
      mockPrisma.conversations.findMany.mockResolvedValueOnce([]);

      await service.getRoomReviews(123, {
        sort: 'rating_desc',
        viewerId: 20,
      });

      expect(mockPrisma.reviews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            room_id: 123,
          },
          orderBy: [
            { rating: 'desc' },
            { created_at: 'desc' },
          ],
        }),
      );
    });

    it('should use rating_asc sorting', async () => {
      mockPrisma.reviews.findMany.mockResolvedValueOnce([]);
      mockPrisma.room_views.findMany.mockResolvedValueOnce([]);
      mockPrisma.conversations.findMany.mockResolvedValueOnce([]);

      await service.getRoomReviews(123, {
        sort: 'rating_asc',
        viewerId: 20,
      });

      expect(mockPrisma.reviews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            room_id: 123,
          },
          orderBy: [
            { rating: 'asc' },
            { created_at: 'desc' },
          ],
        }),
      );
    });

    it('should preserve review response fields', async () => {
      const mockReviews = [
        {
          id: 1,
          user_id: 10,
          room_id: 123,
          rating: 5,
          comment: 'Phòng tốt',
          owner_reply: 'Cảm ơn bạn',
          owner_reply_at: new Date('2026-01-01'),
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-02'),
          user: {
            id: 10,
            full_name: 'Nguyễn Văn A',
            avatar: 'avatar.jpg',
          },
          reactions: [
            {
              user_id: 10,
              reaction_type: 'like',
            },
            {
              user_id: 20,
              reaction_type: 'like',
            },
            {
              user_id: 30,
              reaction_type: 'helpful',
            },
          ],
        },
      ];

      mockPrisma.reviews.findMany.mockResolvedValueOnce(mockReviews);
      mockPrisma.room_views.findMany.mockResolvedValueOnce([
        {
          user_id: 10,
        },
      ]);
      mockPrisma.conversations.findMany.mockResolvedValueOnce([]);

      const result = await service.getRoomReviews(123, {
        viewerId: 10,
      });

      expect(result).toEqual([
        {
          id: 1,
          user_id: 10,
          room_id: 123,
          rating: 5,
          comment: 'Phòng tốt',
          images: [],
          owner_reply: 'Cảm ơn bạn',
          owner_reply_at: new Date('2026-01-01'),
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-02'),
          reactions: {
            like: 2,
            helpful: 1,
          },
          current_user_reactions: ['like'],
          user: {
            id: 10,
            full_name: 'Nguyễn Văn A',
            avatar: 'avatar.jpg',
          },
          verified_interaction: true,
        },
      ]);
    });

    it('should mark review as verified when reviewer has a conversation about the room', async () => {
      const mockReviews = [
        {
          id: 1,
          user_id: 10,
          room_id: 123,
          rating: 5,
          comment: 'Phòng tốt',
          owner_reply: null,
          owner_reply_at: null,
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-01'),
          user: {
            id: 10,
            full_name: 'User 10',
            avatar: null,
          },
          reactions: [],
        },
      ];

      mockPrisma.reviews.findMany.mockResolvedValueOnce(mockReviews);

      mockPrisma.room_views.findMany.mockResolvedValueOnce([]);

      mockPrisma.conversations.findMany.mockResolvedValueOnce([
        {
          user_1_id: 10,
          user_2_id: 20,
        },
      ]);

      const result = await service.getRoomReviews(123);

      expect(result[0].verified_interaction).toBe(true);

      expect(mockPrisma.conversations.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            room_id: 123,
            OR: [
              {
                user_1_id: {
                  in: [10],
                },
              },
              {
                user_2_id: {
                  in: [10],
                },
              },
            ],
          },
          select: {
            user_1_id: true,
            user_2_id: true,
          },
        }),
      );
    });
  });
});
