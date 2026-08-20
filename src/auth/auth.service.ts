import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // 1. Đăng ký tài khoản & Gửi email kích hoạt
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.users.create({
      data: {
        full_name: dto.full_name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'renter',
        is_active: false, // Mặc định khóa cho tới khi bấm link mail
        verification_token: verificationToken,
      },
    });

    // Gửi email bất đồng bộ để tránh làm hoãn response trả về client
    this.mailService
      .sendVerificationEmail(user.email, verificationToken)
      .catch((err) => console.error('Lỗi khi gửi email kích hoạt:', err));

    const { password, verification_token, ...result } = user;
    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản!',
      user: result,
    };
  }

  // 2. Đăng nhập
  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // Chặn đăng nhập nếu chưa xác nhận qua email
    if (!user.is_active) {
      throw new UnauthorizedException(
        'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email của bạn!',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password, verification_token, ...userInfo } = user;
    return {
      message: 'Đăng nhập thành công',
      access_token: accessToken,
      user: userInfo,
    };
  }

  // 3. Kích hoạt tài khoản bằng Token
  async verifyEmail(token: string) {
    const user = await this.prisma.users.findFirst({
      where: { verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.');
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        is_active: true,
        verification_token: null,
      },
    });

    return { message: 'Xác thực email thành công! Bạn đã có thể đăng nhập.' };
  }
}