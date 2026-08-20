"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    constructor() {
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            family: 4,
            auth: {
                user: process.env.GMAIL_USER?.trim(),
                pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
            },
        });
    }
    async sendVerificationEmail(email, token) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const url = `${frontendUrl}/verify?token=${token}`;
        try {
            const info = await this.transporter.sendMail({
                from: `"PhongTro247" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: 'Xác nhận địa chỉ email của bạn - PhongTro247',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
            <h3 style="color: #0f172a; margin-bottom: 16px;">Chào bạn, tin này được gửi từ PhongTro247 🏠</h3>
            <p style="color: #475569; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút bên dưới để xác thực và kích hoạt tài khoản của bạn:</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #ea580c; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">Kích hoạt tài khoản ngay</a>
            </div>
            <p style="color: #64748b; font-size: 13px;">Hoặc copy đường dẫn này dán vào trình duyệt: <br><a href="${url}" style="color: #ea580c;">${url}</a></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          </div>
        `,
            });
            this.logger.log(`[MailService] Email sent successfully to ${email}: ${info.messageId}`);
            return info;
        }
        catch (error) {
            this.logger.error(`[MailService] Failed to send email to ${email}:`, error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map