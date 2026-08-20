import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    
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
  }
}