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

      const [sql, params] = mockPool.query.mock.calls[0];
      expect(sql).toContain("r.status = 'approved'");
      expect(sql).toContain('ORDER BY r.id DESC');
      expect(params).toEqual([]);
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

    it('should filter approved rooms and order by id descending for public request', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await service.getRooms({});

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("AND r.status = 'approved'"),
        [],
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY r.id DESC'),
        [],
      );
    });

    it('should filter rooms by userId when userId is provided', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await service.getRooms({
        userId: 5,
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND r.user_id = $1'),
        [5],
      );
    });

    it('should filter rooms by city code', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await service.getRooms({
        city: '1',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'AND (TRIM(r.city) = $1 OR TRIM(r.city) = $2)',
        ),
        ['1', '01'],
      );
    });

    it('should filter rooms by district code', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await service.getRooms({
        district: '760',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND TRIM(r.district) = $1'),
        ['760'],
      );
    });

    it('should filter rooms by minimum and maximum price', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await service.getRooms({
        minPrice: '2000000',
        maxPrice: '5000000',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND r.price >= $1'),
        [2000000, 5000000],
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND r.price <= $2'),
        [2000000, 5000000],
      );
    });

    it('should filter rooms by minimum and maximum area', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
      });

      await service.getRooms({
        minArea: '20',
        maxArea: '50',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND r.area >= $1'),
        [20, 50],
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND r.area <= $2'),
        [20, 50],
      );
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
      ];

      mockPool.query.mockResolvedValue({
        rows: mockRooms,
      });

      const result = await service.getRooms({});

      expect(result).toEqual({
        total: 1,
        data: mockRooms,
      });
    });
  });
});
