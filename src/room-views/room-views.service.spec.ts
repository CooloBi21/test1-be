import { RoomViewsService } from './room-views.service';

describe('RoomViewsService', () => {
  let service: RoomViewsService;

  const prisma = {
    room_views: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoomViewsService(prisma as any);
  });

  describe('recordView', () => {
    it('should create a room view record with the correct user and room', async () => {
      const createdView = {
        id: 1,
        user_id: 10,
        room_id: 20,
      };

      prisma.room_views.create.mockResolvedValue(createdView);

      const result = await service.recordView(10, 20);

      expect(prisma.room_views.create).toHaveBeenCalledWith({
        data: {
          user_id: 10,
          room_id: 20,
        },
      });

      expect(result).toEqual(createdView);
    });
  });

  describe('getViewHistory', () => {
    it('should return the user view history with room data ordered by viewed_at descending', async () => {
      const history = [
        {
          id: 2,
          user_id: 10,
          room_id: 20,
          room: {
            id: 20,
            title: 'Room B',
          },
        },
        {
          id: 1,
          user_id: 10,
          room_id: 15,
          room: {
            id: 15,
            title: 'Room A',
          },
        },
      ];

      prisma.room_views.findMany.mockResolvedValue(history);

      const result = await service.getViewHistory(10);

      expect(prisma.room_views.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
        },
        include: {
          room: true,
        },
        orderBy: {
          viewed_at: 'desc',
        },
      });

      expect(result).toEqual(history);
    });
  });

  describe('clearHistory', () => {
    it('should delete all view history belonging to the user', async () => {
      const deleteResult = {
        count: 3,
      };

      prisma.room_views.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.clearHistory(10);

      expect(prisma.room_views.deleteMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
        },
      });

      expect(result).toEqual(deleteResult);
    });
  });

  describe('removeHistoryItem', () => {
    it('should delete the specified room from the user view history', async () => {
      const deleteResult = {
        count: 1,
      };

      prisma.room_views.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.removeHistoryItem(10, 20);

      expect(prisma.room_views.deleteMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          room_id: 20,
        },
      });

      expect(result).toEqual(deleteResult);
    });
  });
});