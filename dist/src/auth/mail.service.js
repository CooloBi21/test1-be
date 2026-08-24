"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
let MailService = MailService_1 = class MailService {
    constructor() {
        this.logger = new common_1.Logger(MailService_1.name);
    }
    async sendVerificationEmail(email, token) {
        const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            this.logger.error('Thiếu BREVO_API_KEY trong biến môi trường.');
            throw new Error('Chưa cấu hình BREVO_API_KEY');
        }
        const payload = {
            sender: {
                name: 'PhongTro247',
                email: process.env.GMAIL_USER,
            },
            to: [{ email }],
            subject: 'Xác nhận địa chỉ email của bạn',
            htmlContent: `
        <h3>Chào bạn, tin này được gửi đến từ PhongTro247</h3>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào đường dẫn bên dưới để kích hoạt tài khoản:</p>
        <a href="${url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Kích hoạt tài khoản ngay</a>
      `,
        };
        try {
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(`Brevo API trả về lỗi ${response.status}: ${errorBody}`);
            }
            this.logger.log(`Email xác thực đã gửi thành công tới ${email}`);
        }
        catch (err) {
            this.logger.error(`Failed to send verification email to ${email}:`, err);
            throw err;
        }
    }
    async sendForgotPasswordEmail(email, tempPasswordHex) {
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            this.logger.error('Thiếu BREVO_API_KEY trong biến môi trường.');
            throw new Error('Chưa cấu hình BREVO_API_KEY');
        }
        const payload = {
            sender: {
                name: 'PhongTro247',
                email: process.env.GMAIL_USER,
            },
            to: [{ email }],
            subject: 'Mật khẩu đăng nhập tạm thời của bạn',
            htmlContent: `
        <h3>Chào bạn,</h3>
        <p>Hệ thống đã nhận được yêu cầu cấp lại mật khẩu cho tài khoản của bạn.</p>
        <p>Mật khẩu tạm thời của bạn là: <b style="font-size: 20px; color: #d9534f; letter-spacing: 2px;">${tempPasswordHex}</b></p>
        <p>Vui lòng sử dụng mật khẩu này để đăng nhập và <b>vào mục Cài đặt tài khoản để đổi lại mật khẩu</b> của riêng bạn nhằm bảo đảm an toàn.</p>
      `,
        };
        try {
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(`Brevo API trả về lỗi ${response.status}: ${errorBody}`);
            }
            this.logger.log(`Email cấp lại mật khẩu đã gửi thành công tới ${email}`);
        }
        catch (err) {
            this.logger.error(`Failed to send forgot password email to ${email}:`, err);
            throw err;
        }
    }
    async sendPasswordChangedSuccessEmail(email) {
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            this.logger.error('Thiếu BREVO_API_KEY trong biến môi trường.');
            throw new Error('Chưa cấu hình BREVO_API_KEY');
        }
        const payload = {
            sender: {
                name: 'PhongTro247',
                email: process.env.GMAIL_USER,
            },
            to: [{ email }],
            subject: 'Thay đổi mật khẩu thành công',
            htmlContent: `
        <h3>Chào bạn,</h3>
        <p>Mật khẩu tài khoản PhongTro247 của bạn vừa được thay đổi thành công.</p>
        <p>Nếu bạn không thực hiện thao tác này, vui lòng liên hệ với ban quản trị ngay lập tức.</p>
      `,
        };
        try {
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                throw new Error(`Brevo API trả về lỗi ${response.status}: ${errorBody}`);
            }
            this.logger.log(`Email thông báo đổi mật khẩu đã gửi thành công tới ${email}`);
        }
        catch (err) {
            this.logger.error(`Failed to send password changed email to ${email}:`, err);
            throw err;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map