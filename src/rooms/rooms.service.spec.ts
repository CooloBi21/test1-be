import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  const mockPool = {
    query: jest.fn(),
  };

  const mockPrisma = {};
  const mockNotificationsService = {};

  beforeEach(() => {
    jest.clearAllMocks();

    service = new RoomsService(
      mockPool as any,
      mockPrisma as any,
      mockNotificationsService as any,
    );
  });

  describe('getRoomById', () => {
    it('should throw NotFoundException when room does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await expect(service.getRoomById('999')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should return room when room exists', async () => {
      const mockRoom = {
        id: 123,
        title: 'Phòng trọ test',
        price: 2500000,
        area: 25,
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRoom],
      });

      const result = await service.getRoomById('123');

      expect(result).toEqual(mockRoom);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRooms', () => {
    it('should return approved rooms when userId is not provided', async () => {
      const mockRooms = [
        {
          id: 2,
          title: 'Phòng trọ 2',
          status: 'approved',
        },
        {
          id: 1,
          title: 'Phòng trọ 1',
          status: 'approved',
        },
      ];

      mockPool.query.mockResolvedValue({
        rows: mockRooms,
      });

      const result = await service.getRooms({});

      expect(result).toEqual({
        total: 2,
        data: mockRooms,
      });

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should return rooms belonging to the specified user', async () => {
      const mockRooms = [
        {
          id: 10,
          title: 'Phòng của user 5',
          user_id: 5,
        },
      ];

      mockPool.query.mockResolvedValue({
        rows: mockRooms,
      });

      const result = await service.getRooms({
        userId: 5,
      });

      expect(result).toEqual({
        total: 1,
        data: mockRooms,
      });

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });
});