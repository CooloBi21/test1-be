import { PrismaService } from '../prisma/prisma.service';
export declare class AdminUsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(roleFilter?: string): Promise<{
        created_at: Date;
        id: number;
        full_name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        is_banned: boolean;
        ban_reason: string;
    }[]>;
    updateUserRole(currentUserEmail: string, targetUserId: number, newRole: string): Promise<{
        created_at: Date | null;
        id: number;
        full_name: string;
        email: string;
        password: string;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role | null;
        is_active: boolean;
        verification_token: string | null;
        is_banned: boolean;
        ban_reason: string | null;
    }>;
    banUser(id: number, reason: string): Promise<{
        created_at: Date | null;
        id: number;
        full_name: string;
        email: string;
        password: string;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role | null;
        is_active: boolean;
        verification_token: string | null;
        is_banned: boolean;
        ban_reason: string | null;
    }>;
    unbanUser(id: number): Promise<{
        created_at: Date | null;
        id: number;
        full_name: string;
        email: string;
        password: string;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role | null;
        is_active: boolean;
        verification_token: string | null;
        is_banned: boolean;
        ban_reason: string | null;
    }>;
}
