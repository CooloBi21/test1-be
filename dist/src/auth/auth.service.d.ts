import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { MailService } from './mail.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    private googleClient;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            created_at: Date | null;
            id: number;
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role | null;
            is_active: boolean;
            is_banned: boolean;
            ban_reason: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        access_token: string;
        user: {
            created_at: Date | null;
            id: number;
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role | null;
            is_active: boolean;
            is_banned: boolean;
            ban_reason: string | null;
        };
    }>;
    googleLogin(idToken: string): Promise<{
        message: string;
        access_token: string;
        user: {
            created_at: Date | null;
            id: number;
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role | null;
            is_active: boolean;
            is_banned: boolean;
            ban_reason: string | null;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    changePassword(userId: number, currentPass: string, newPass: string): Promise<{
        message: string;
    }>;
    updateProfile(userId: number, fullName: string, phone?: string): Promise<{
        created_at: Date | null;
        id: number;
        full_name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role | null;
        is_active: boolean;
        is_banned: boolean;
        ban_reason: string | null;
    }>;
}
