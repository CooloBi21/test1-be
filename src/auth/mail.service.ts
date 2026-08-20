import { Injectable, Logger } from '@nestjs/common';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendVerificationEmail(email: string, token: string) {
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
        throw new Error(
          `Brevo API trả về lỗi ${response.status}: ${errorBody}`,
        );
      }

      this.logger.log(`Email xác thực đã gửi thành công tới ${email}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}:`, err);
      throw err;
    }
  }
}