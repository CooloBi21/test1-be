import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(roleFilter?: string) {
    const targetRole = roleFilter ? (roleFilter as Role) : undefined;

    return this.prisma.users.findMany({
      where: targetRole ? { role: targetRole } : {},
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_banned: true,
        ban_reason: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateUserRole(currentUserEmail: string, targetUserId: number, newRole: string) {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'ggmaytinh@gmail.com';

    // 1. Chặn cấp Backend: Chỉ Super Admin mới có quyền gọi API này
    if (currentUserEmail !== superAdminEmail) {
      throw new ForbiddenException('Chỉ tài khoản Super Admin mới có quyền thực hiện thao tác này!');
    }

    // 2. Kiểm tra sự tồn tại của người dùng
    const targetUser = await this.prisma.users.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // 3. Không cho phép hạ quyền của Super Admin gốc
    if (targetUser.email === superAdminEmail) {
      throw new BadRequestException('Không thể thay đổi vai trò của tài khoản Super Admin gốc!');
    }

    // 4. Ép kiểu về Role enum của Prisma (admin / renter)
    const formattedRole = newRole.toLowerCase() as Role;

    return this.prisma.users.update({
      where: { id: targetUserId },
      data: { role: formattedRole },
    });
  }

  async banUser(id: number, reason: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // BẢO VỆ SUPER ADMIN: Không cho phép khóa tài khoản Super Admin gốc
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'ggmaytinh@gmail.com';
    if (user.email === superAdminEmail) {
      throw new BadRequestException('Không thể khóa tài khoản Super Admin gốc!');
    }

    return this.prisma.users.update({
      where: { id },
      data: { is_banned: true, ban_reason: reason },
    });
  }

  async unbanUser(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.prisma.users.update({
      where: { id },
      data: { is_banned: false, ban_reason: null },
    });
  }
}