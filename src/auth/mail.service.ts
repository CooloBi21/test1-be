import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';

// Render (và nhiều host cloud khác) không có route IPv6 ổn định ra ngoài.
// Từ Node 18+, dns.lookup() có thể trả về địa chỉ IPv6 trước (happy eyeballs),
// khiến kết nối SMTP bị ENETUNREACH dù smtp.gmail.com vẫn hoạt động bình thường
// qua IPv4. Ép thứ tự resolve ưu tiên IPv4 toàn cục — không hardcode IP của Google
// vì dải IP đó xoay vòng liên tục, hardcode sẽ gãy lại sau một thời gian.
dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

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
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}:`, err);
      throw err;
    }
  }
}