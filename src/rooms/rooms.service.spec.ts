// src/rooms/rooms.service.spec.ts
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
      create: jest.fn(),
      update: jest.fn(),
    },
    saved_posts: {
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

  describe('findAllForAdmin', () => {
    it('should return all rooms with city, district and user information', async () => {
      const mockRooms = [
        {
          id: 2,
          title: 'Phòng trọ 2',
          price: 3000000,
          area: 25,
          city: '79',
          district: '760',
          status: RoomStatus.pending,
          provinces: {
            name: 'TP. Hồ Chí Minh',
          },
          districts: {
            name: 'Quận 1',
          },
          user: {
            id: 5,
            full_name: 'Nguyễn Văn Test',
            email: 'test@example.com',
            phone: '0123456789',
            avatar: 'avatar.jpg',
          },
        },
        {
          id: 1,
          title: 'Phòng trọ 1',
          price: 2500000,
          area: 20,
          city: '79',
          district: '760',
          status: RoomStatus.approved,
          provinces: {
            name: 'TP. Hồ Chí Minh',
          },
          districts: {
            name: 'Quận 1',
          },
          user: null,
        },
      ];

      mockPrisma.rooms.findMany.mockResolvedValue(mockRooms);

      const result = await service.findAllForAdmin();

      expect(result).toEqual({
        total: 2,
        data: [
          {
            ...mockRooms[0],
            city_name: 'TP. Hồ Chí Minh',
            district_name: 'Quận 1',
            user: {
              id: 5,
              full_name: 'Nguyễn Văn Test',
              email: 'test@example.com',
              phone: '0123456789',
              avatar: 'avatar.jpg',
            },
          },
          {
            ...mockRooms[1],
            city_name: 'TP. Hồ Chí Minh',
            district_name: 'Quận 1',
            user: null,
          },
        ],
      });

      expect(mockPrisma.rooms.findMany).toHaveBeenCalledTimes(1);
    });

    it('should prioritize pending rooms before approved and rejected rooms', async () => {
      const mockRooms = [
        {
          id: 10,
          title: 'Phòng rejected',
          status: RoomStatus.rejected,
          provinces: null,
          districts: null,
          user: null,
        },
        {
          id: 20,
          title: 'Phòng approved',
          status: RoomStatus.approved,
          provinces: null,
          districts: null,
          user: null,
        },
        {
          id: 30,
          title: 'Phòng pending',
          status: RoomStatus.pending,
          provinces: null,
          districts: null,
          user: null,
        },
      ];

      mockPrisma.rooms.findMany.mockResolvedValue(mockRooms);

      const result = await service.findAllForAdmin();

      expect(result.data.map((room) => room.status)).toEqual([
        RoomStatus.pending,
        RoomStatus.approved,
        RoomStatus.rejected,
      ]);
    });
  });

  describe('createRoom', () => {
    it('should throw BadRequestException when required fields are missing', async () => {
      const invalidDto = {
        title: 'Phòng trọ test',
        // thiếu price, area, city, district
      };

      await expect(service.createRoom(invalidDto as any, 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a room with the provided data', async () => {
      const mockRoom = {
        id: 123,
        title: 'Phòng trọ test',
        price: 3000000,
        area: 25,
        city: '79',
        district: '760',
        content: 'Phòng đầy đủ tiện nghi',
        thumbnail: 'thumbnail.jpg',
        images: ['image1.jpg', 'image2.jpg'],
        amenities: ['wifi', 'parking'],
        user_id: 5,
        status: RoomStatus.pending,
      };

      mockPrisma.rooms.create.mockResolvedValue(mockRoom);

      const dto = {
        title: 'Phòng trọ test',
        price: 3000000,
        area: 25,
        city: '79',
        district: '760',
        content: 'Phòng đầy đủ tiện nghi',
        thumbnail: 'thumbnail.jpg',
        images: ['image1.jpg', 'image2.jpg'],
        amenities: ['wifi', 'parking'],
      };

      const result = await service.createRoom(dto as any, 5);

      expect(result).toEqual(mockRoom);

      expect(mockPrisma.rooms.create).toHaveBeenCalledWith({
        data: {
          title: 'Phòng trọ test',
          price: 3000000,
          area: 25,
          city: '79',
          district: '760',
          content: 'Phòng đầy đủ tiện nghi',
          thumbnail: 'thumbnail.jpg',
          images: ['image1.jpg', 'image2.jpg'],
          amenities: ['wifi', 'parking'],
          user_id: 5,
          status: RoomStatus.pending,
        },
      });
    });

    it('should set default values for optional fields when not provided', async () => {
      const mockRoom = {
        id: 124,
        title: 'Phòng tối giản',
        price: 2000000,
        area: 20,
        city: '79',
        district: '760',
        content: null,
        thumbnail: null,
        images: [],
        amenities: [],
        user_id: null,
        status: RoomStatus.pending,
      };

      mockPrisma.rooms.create.mockResolvedValue(mockRoom);

      const dto = {
        title: 'Phòng tối giản',
        price: 2000000,
        area: 20,
        city: '79',
        district: '760',
      };

      const result = await service.createRoom(dto as any);

      expect(result).toEqual(mockRoom);

      expect(mockPrisma.rooms.create).toHaveBeenCalledWith({
        data: {
          title: 'Phòng tối giản',
          price: 2000000,
          area: 20,
          city: '79',
          district: '760',
          content: null,
          thumbnail: null,
          images: [],
          amenities: [],
          user_id: null,
          status: RoomStatus.pending,
        },
      });
    });
  });

  describe('updateRoom', () => {
    it('should throw NotFoundException when room does not exist', async () => {
      mockPrisma.rooms.findUnique.mockResolvedValueOnce(null);

      const dto = {
        title: 'Phòng mới',
        price: 2000000,
        area: 20,
        city: '01',
        district: '001',
      };

      await expect(
        service.updateRoom('123', dto as any, 5),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.rooms.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
      });
    });

    it('should throw ForbiddenException when user is not the room owner', async () => {
      mockPrisma.rooms.findUnique.mockResolvedValueOnce({
        id: 123,
        user_id: 10,
        title: 'Phòng cũ',
      });

      const dto = {
        title: 'Phòng mới',
        price: 2000000,
        area: 20,
        city: '01',
        district: '001',
      };

      await expect(
        service.updateRoom('123', dto as any, 5),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.rooms.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
      });
    });

    it('should update room and return changed fields', async () => {
      const oldRoom = {
        id: 123,
        user_id: 5,
        title: 'Phòng cũ',
        price: 2000000,
        area: 20,
        city: '79',
        district: '760',
        content: 'Nội dung cũ',
        thumbnail: 'old.jpg',
        images: ['old-image.jpg'],
        amenities: ['wifi'],
      };

      const updatedRoom = {
        ...oldRoom,
        title: 'Phòng mới',
        price: 2500000,
        thumbnail: 'new.jpg',
      };

      mockPrisma.rooms.findUnique.mockResolvedValueOnce(oldRoom);
      mockPrisma.rooms.update.mockResolvedValueOnce(updatedRoom);
      mockPrisma.saved_posts.findMany.mockResolvedValue([]);

      const dto = {
        title: 'Phòng mới',
        price: 2500000,
        thumbnail: 'new.jpg',
      };

      const result = await service.updateRoom('123', dto as any, 5);

      expect(result).toEqual({
        data: updatedRoom,
        changes: [
          {
            field: 'price',
            oldValue: 2000000,
            newValue: 2500000,
          },
          {
            field: 'title',
            oldValue: 'Phòng cũ',
            newValue: 'Phòng mới',
          },
          {
            field: 'thumbnail',
            oldValue: 'old.jpg',
            newValue: 'new.jpg',
          },
        ],
      });

      expect(mockPrisma.rooms.update).toHaveBeenCalledWith({
        where: {
          id: 123,
        },
        data: {
          title: 'Phòng mới',
          price: 2500000,
          area: 20,
          city: '79',
          district: '760',
          content: 'Nội dung cũ',
          thumbnail: 'new.jpg',
          images: ['old-image.jpg'],
          amenities: ['wifi'],
        },
      });
    });

    it('should return old room without updating when no fields change', async () => {
      const oldRoom = {
        id: 123,
        user_id: 5,
        title: 'Phòng cũ',
        price: 2000000,
        area: 20,
        city: '79',
        district: '760',
        content: 'Nội dung cũ',
        thumbnail: 'old.jpg',
        images: ['old-image.jpg'],
        amenities: ['wifi'],
      };

      mockPrisma.rooms.findUnique.mockResolvedValueOnce(oldRoom);

      const dto = {
        title: 'Phòng cũ',
        price: 2000000,
      };

      const result = await service.updateRoom('123', dto as any, 5);

      expect(result).toEqual({
        data: oldRoom,
        changes: [],
      });

      expect(mockPrisma.rooms.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
      });
      expect(mockPrisma.rooms.update).not.toHaveBeenCalled();
    });
  });
});
