import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { MailService } from './mail.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: string | null;
            created_at: Date | null;
            is_active: boolean;
            id: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        access_token: string;
        user: {
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: string | null;
            created_at: Date | null;
            is_active: boolean;
            id: number;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
}
