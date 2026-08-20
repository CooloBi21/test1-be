import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Sử dụng STARTTLS cho cổng 587
      family: 4, // ÉP DÙNG IPV4 để xử lý lỗi ENETUNREACH do Render/Cloud không hỗ trợ IPv6
      auth: {
        user: process.env.GMAIL_USER?.trim(),
        pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''), // Loại bỏ khoảng trắng trong App Password
      },
    } as nodemailer.TransportOptions);
  }

  async sendVerificationEmail(email: string, token: string) {
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
    } catch (error) {
      this.logger.error(`[MailService] Failed to send email to ${email}:`, error);
    }
  }
}