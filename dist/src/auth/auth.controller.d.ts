import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: string | null;
            created_at: Date | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        access_token: string;
        user: {
            id: number;
            full_name: string;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: string | null;
            created_at: Date | null;
        };
    }>;
    getProfile(req: any): any;
}
