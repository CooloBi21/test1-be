import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Đăng ký tài khoản
  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Lưu vào DB
    const user = await this.prisma.users.create({
      data: {
        full_name: dto.full_name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'renter',
      },
    });

    // Trả về thông báo (Ẩn password)
    const { password, ...result } = user;
    return { message: 'Đăng ký thành công', user: result };
  }

  // 2. Đăng nhập
  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // Tạo JWT Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...userInfo } = user;
    return {
      message: 'Đăng nhập thành công',
      access_token: accessToken,
      user: userInfo,
    };
  }
}