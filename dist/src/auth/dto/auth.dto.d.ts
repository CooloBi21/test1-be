export declare class RegisterDto {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ChangePasswordDto {
    current_password: string;
    new_password: string;
}
export declare class UpdateProfileDto {
    full_name: string;
    phone?: string;
}
