"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminUsersService = class AdminUsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(roleFilter) {
        const targetRole = roleFilter ? roleFilter : undefined;
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
    async updateUserRole(currentUserEmail, targetUserId, newRole) {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'ggmaytinh@gmail.com';
        if (currentUserEmail !== superAdminEmail) {
            throw new common_1.ForbiddenException('Chỉ tài khoản Super Admin mới có quyền thực hiện thao tác này!');
        }
        const targetUser = await this.prisma.users.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        if (targetUser.email === superAdminEmail) {
            throw new common_1.BadRequestException('Không thể thay đổi vai trò của tài khoản Super Admin gốc!');
        }
        const formattedRole = newRole.toLowerCase();
        return this.prisma.users.update({
            where: { id: targetUserId },
            data: { role: formattedRole },
        });
    }
    async banUser(id, reason) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'ggmaytinh@gmail.com';
        if (user.email === superAdminEmail) {
            throw new common_1.BadRequestException('Không thể khóa tài khoản Super Admin gốc!');
        }
        return this.prisma.users.update({
            where: { id },
            data: { is_banned: true, ban_reason: reason },
        });
    }
    async unbanUser(id) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        return this.prisma.users.update({
            where: { id },
            data: { is_banned: false, ban_reason: null },
        });
    }
};
exports.AdminUsersService = AdminUsersService;
exports.AdminUsersService = AdminUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminUsersService);
//# sourceMappingURL=admin-users.service.js.map