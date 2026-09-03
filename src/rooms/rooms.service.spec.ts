import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  const mockPool = {
    query: jest.fn(),
  };

  const mockPrisma = {
    rooms: {
      findUnique: jest.fn(),
    },
  };

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
      mockPrisma.rooms.findUnique.mockResolvedValue(null);

      await expect(service.getRoomById('999')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.rooms.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return room with province, district and user when room exists', async () => {
      const mockRoom = {
        id: 123,
        title: 'Phòng trọ test',
        price: 2500000,
        area: 25,
        city: '79',
        district: '760',
        provinces: {
          name: 'TP. Hồ Chí Minh',
        },
        districts: {
          name: 'Quận 1',
        },
        user: {
          id: 5,
          full_name: 'Nguyễn Văn Test',
          phone: '0123456789',
          avatar: 'avatar.jpg',
          is_active: true,
        },
      };

      mockPrisma.rooms.findUnique.mockResolvedValue(mockRoom);

      const result = await service.getRoomById('123');

      expect(result).toEqual({
        ...mockRoom,
        city_name: 'TP. Hồ Chí Minh',
        district_name: 'Quận 1',
        user: {
          id: 5,
          full_name: 'Nguyễn Văn Test',
          phone: '0123456789',
          avatar: 'avatar.jpg',
          is_verified: true,
        },
      });

      expect(mockPrisma.rooms.findUnique).toHaveBeenCalledWith({
        where: {
          id: 123,
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
      });
    });

    it('should return null user when room has no owner', async () => {
      const mockRoom = {
        id: 456,
        title: 'Phòng trọ không có chủ',
        price: 2000000,
        area: 20,
        city: '79',
        district: '760',
        provinces: {
          name: 'TP. Hồ Chí Minh',
        },
        districts: {
          name: 'Quận 1',
        },
        user: null,
      };

      mockPrisma.rooms.findUnique.mockResolvedValue(mockRoom);

      const result = await service.getRoomById('456');

      expect(result).toEqual({
        ...mockRoom,
        city_name: 'TP. Hồ Chí Minh',
        district_name: 'Quận 1',
        user: null,
      });
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