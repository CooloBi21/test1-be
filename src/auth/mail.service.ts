import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Dùng STARTTLS thay vì SSL trực tiếp (Port 465)
    requireTLS: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Ép Nodemailer phân giải DNS duy nhất qua IPv4
    lookup: (hostname, options, callback) => {
      return dns.lookup(hostname, { family: 4 }, callback);
    },
  } as nodemailer.TransportOptions);

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"PhongTro247" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Xác nhận địa chỉ email của bạn',
        html: `
          <h3>Chào bạn, tin này được gửi đến từ PhongTro247</h3>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào đường dẫn bên dưới để kích hoạt tài khoản:</p>
          <a href="${url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Kích hoạt tài khoản ngay</a>
        `,
      });
      this.logger.log(`Email sent successfully to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}:`, err);
      throw err;
    }
  }
}