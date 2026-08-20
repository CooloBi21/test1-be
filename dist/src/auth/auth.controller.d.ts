import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
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
            role: string | null;
            is_active: boolean;
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
            is_active: boolean;
        };
    }>;
    getProfile(req: any): any;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
}
