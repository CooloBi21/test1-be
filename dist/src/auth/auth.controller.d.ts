import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    googleLogin(dto: GoogleLoginDto): Promise<{
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
    getProfile(req: any): any;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
