export declare class MailService {
    private readonly logger;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendForgotPasswordEmail(email: string, tempPasswordHex: string): Promise<void>;
    sendPasswordChangedSuccessEmail(email: string): Promise<void>;
}
