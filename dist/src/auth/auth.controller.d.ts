import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): any;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
}
