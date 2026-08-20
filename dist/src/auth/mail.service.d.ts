export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendVerificationEmail(email: string, token: string): Promise<any>;
}
