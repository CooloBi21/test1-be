import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let prisma: any;

  const superAdminEmail = 'ggmaytinh@gmail.com';

  beforeEach(() => {
    process.env.SUPER_ADMIN_EMAIL = superAdminEmail;

    prisma = {
      users: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new AdminUsersService(prisma);
  });

  afterEach(() => {
    delete process.env.SUPER_ADMIN_EMAIL;
  });

  describe('getAllUsers', () => {
    it('should return all users when no role filter is provided', async () => {
      const users = [
        {
          id: 2,
          full_name: 'User A',
          email: 'user-a@example.com',
          role: 'renter',
          is_banned: false,
          ban_reason: null,
          created_at: new Date('2026-01-02'),
        },
      ];

      prisma.users.findMany.mockResolvedValue(users);

      await expect(service.getAllUsers()).resolves.toEqual(users);

      expect(prisma.users.findMany).toHaveBeenCalledWith({
        where: {},
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          is_banned: true,
          ban_reason: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('should filter users by role when a role filter is provided', async () => {
      const users = [
        {
          id: 3,
          full_name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          is_banned: false,
          ban_reason: null,
          created_at: new Date('2026-01-03'),
        },
      ];

      prisma.users.findMany.mockResolvedValue(users);

      await expect(service.getAllUsers('admin')).resolves.toEqual(users);

      expect(prisma.users.findMany).toHaveBeenCalledWith({
        where: {
          role: 'admin',
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          is_banned: true,
          ban_reason: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });
  });

  describe('updateUserRole', () => {
    it('should reject when the current user is not the Super Admin', async () => {
      await expect(
        service.updateUserRole(
          'normal-admin@example.com',
          10,
          'admin',
        ),
      ).rejects.toThrow(
        new ForbiddenException(
          'Chỉ tài khoản Super Admin mới có quyền thực hiện thao tác này!',
        ),
      );

      expect(prisma.users.findUnique).not.toHaveBeenCalled();
      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('should reject when the target user does not exist', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserRole(superAdminEmail, 999, 'admin'),
      ).rejects.toThrow(
        new NotFoundException('Không tìm thấy người dùng'),
      );

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });

      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('should reject when trying to change the original Super Admin role', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 1,
        email: superAdminEmail,
        role: 'admin',
      });

      await expect(
        service.updateUserRole(superAdminEmail, 1, 'renter'),
      ).rejects.toThrow(
        new BadRequestException(
          'Không thể thay đổi vai trò của tài khoản Super Admin gốc!',
        ),
      );

      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('should update the target user role when the request is valid', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 10,
        email: 'user@example.com',
        role: 'renter',
      });

      const updatedUser = {
        id: 10,
        email: 'user@example.com',
        role: 'admin',
      };

      prisma.users.update.mockResolvedValue(updatedUser);

      await expect(
        service.updateUserRole(superAdminEmail, 10, 'ADMIN'),
      ).resolves.toEqual(updatedUser);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
      });

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
        data: {
          role: 'admin',
        },
      });
    });
  });

  describe('banUser', () => {
    it('should reject when the user does not exist', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.banUser(999, 'Vi phạm quy định'),
      ).rejects.toThrow(
        new NotFoundException('Không tìm thấy người dùng'),
      );

      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('should reject when trying to ban the original Super Admin', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 1,
        email: superAdminEmail,
        is_banned: false,
      });

      await expect(
        service.banUser(1, 'Vi phạm quy định'),
      ).rejects.toThrow(
        new BadRequestException(
          'Không thể khóa tài khoản Super Admin gốc!',
        ),
      );

      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('should ban the user and save the ban reason when the request is valid', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 10,
        email: 'user@example.com',
        is_banned: false,
      });

      const bannedUser = {
        id: 10,
        email: 'user@example.com',
        is_banned: true,
        ban_reason: 'Vi phạm quy định',
      };

      prisma.users.update.mockResolvedValue(bannedUser);

      await expect(
        service.banUser(10, 'Vi phạm quy định'),
      ).resolves.toEqual(bannedUser);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
      });

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
        data: {
          is_banned: true,
          ban_reason: 'Vi phạm quy định',
        },
      });
    });
  });

  describe('unbanUser', () => {
    it('should reject when the user does not exist', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(service.unbanUser(999)).rejects.toThrow(
        new NotFoundException('Không tìm thấy người dùng'),
      );

      expect(prisma.users.update).not.toHaveBeenCalled();
    });

    it('should unban the user and clear the ban reason when the request is valid', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 10,
        email: 'user@example.com',
        is_banned: true,
        ban_reason: 'Vi phạm quy định',
      });

      const unbannedUser = {
        id: 10,
        email: 'user@example.com',
        is_banned: false,
        ban_reason: null,
      };

      prisma.users.update.mockResolvedValue(unbannedUser);

      await expect(service.unbanUser(10)).resolves.toEqual(unbannedUser);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
      });

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: {
          id: 10,
        },
        data: {
          is_banned: false,
          ban_reason: null,
        },
      });
    });
  });
});