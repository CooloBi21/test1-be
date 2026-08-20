import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4, // Ép net.connect() chỉ dùng IPv4, tắt hoàn toàn Happy Eyeballs
    auth: {
      user: process.env.GMAIL_USER?.trim(),
      pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
    },
  } as nodemailer.TransportOptions);

  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/verify?token=${token}`;

    try {
      const info = await this.transporter.sendMail({
        from: `"PhongTro247" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Xác nhận địa chỉ email của bạn',
        html: `
          <h3>Chào bạn, tin này được gửi đến từ PhongTro247</h3>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào đường dẫn bên dưới để kích hoạt tài khoản:</p>
          <a href="${url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Kích hoạt tài khoản ngay</a>
        `,
      });
      this.logger.log(`Email sent successfully to ${email}: ${info.messageId}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}:`, err);
    }
  }
}