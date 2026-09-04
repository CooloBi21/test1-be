// src/rooms/rooms.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { RoomStatus } from '@prisma/client';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  const mockPool = {
    query: jest.fn(),
  };

  const mockPrisma = {
    rooms: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
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
          provinces: null,
          districts: null,
          user: null,
        },
        {
          id: 1,
          title: 'Phòng trọ 1',
          status: 'approved',
          provinces: null,
          districts: null,
          user: null,
        },
      ];

      mockPrisma.rooms.findMany.mockResolvedValue(mockRooms);

      const result = await service.getRooms({});

      expect(result).toEqual({
        total: 2,
        data: [
          {
            ...mockRooms[0],
            city_name: null,
            district_name: null,
            user: null,
          },
          {
            ...mockRooms[1],
            city_name: null,
            district_name: null,
            user: null,
          },
        ],
      });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should return rooms belonging to the specified user', async () => {
      const mockRooms = [
        {
          id: 10,
          title: 'Phòng của user 5',
          user_id: 5,
          provinces: null,
          districts: null,
          user: null,
        },
      ];

      mockPrisma.rooms.findMany.mockResolvedValue(mockRooms);

      const result = await service.getRooms({ userId: 5 });

      expect(result).toEqual({
        total: 1,
        data: [
          {
            ...mockRooms[0],
            city_name: null,
            district_name: null,
            user: null,
          },
        ],
      });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 5,
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should filter approved rooms and order by id descending for public request', async () => {
      mockPrisma.rooms.findMany.mockResolvedValue([]);

      await service.getRooms({});

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should filter rooms by userId when userId is provided', async () => {
      mockPrisma.rooms.findMany.mockResolvedValue([]);

      await service.getRooms({ userId: 5 });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 5,
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should filter rooms by city code', async () => {
      mockPrisma.rooms.findMany.mockResolvedValue([]);

      await service.getRooms({ city: '1' });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
          city: {
            in: ['1', '01'],
          },
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should filter rooms by district code', async () => {
      mockPrisma.rooms.findMany.mockResolvedValue([]);

      await service.getRooms({ district: '760' });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
          district: '760',
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should filter rooms by minimum and maximum price', async () => {
      mockPrisma.rooms.findMany.mockResolvedValue([]);

      await service.getRooms({
        minPrice: '2000000',
        maxPrice: '5000000',
      });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
          price: {
            gte: 2000000,
            lte: 5000000,
          },
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should filter rooms by minimum and maximum area', async () => {
      mockPrisma.rooms.findMany.mockResolvedValue([]);

      await service.getRooms({
        minArea: '20',
        maxArea: '50',
      });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
          area: {
            gte: 20,
            lte: 50,
          },
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should preserve room response mapping from database result', async () => {
      const mockRooms = [
        {
          id: 10,
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
        },
      ];

      mockPrisma.rooms.findMany.mockResolvedValue(mockRooms);

      const result = await service.getRooms({});

      expect(result).toEqual({
        total: 1,
        data: [
          {
            ...mockRooms[0],
            city_name: 'TP. Hồ Chí Minh',
            district_name: 'Quận 1',
            user: {
              id: 5,
              full_name: 'Nguyễn Văn Test',
              phone: '0123456789',
              avatar: 'avatar.jpg',
              is_verified: true,
            },
          },
        ],
      });
    });

    it('should query rooms with Prisma using filters and relations', async () => {
      const mockRooms = [
        {
          id: 10,
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
        },
      ];

      mockPrisma.rooms.findMany.mockResolvedValue(mockRooms);

      const result = await service.getRooms({
        city: '1',
        district: '760',
        minPrice: '2000000',
        maxPrice: '5000000',
        minArea: '20',
        maxArea: '50',
      });

      expect(result).toEqual({
        total: 1,
        data: [
          {
            ...mockRooms[0],
            city_name: 'TP. Hồ Chí Minh',
            district_name: 'Quận 1',
            user: {
              id: 5,
              full_name: 'Nguyễn Văn Test',
              phone: '0123456789',
              avatar: 'avatar.jpg',
              is_verified: true,
            },
          },
        ],
      });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledWith({
        where: {
          status: RoomStatus.approved,
          city: {
            in: ['1', '01'],
          },
          district: '760',
          price: {
            gte: 2000000,
            lte: 5000000,
          },
          area: {
            gte: 20,
            lte: 50,
          },
        },
        include: {
          provinces: true,
          districts: true,
          user: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    });
  });
});
