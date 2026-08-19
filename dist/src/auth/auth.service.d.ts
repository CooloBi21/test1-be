import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            created_at: Date | null;
            id: number;
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: string | null;
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
            role: string | null;
        };
    }>;
}
