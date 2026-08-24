import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản!',
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

    // Chặn đăng nhập nếu tài khoản bị khóa
    if ((user as any).is_banned) {
      throw new ForbiddenException({
        message: 'Tài khoản của bạn đã bị khóa.',
        reason: (user as any).ban_reason || 'Vi phạm điều khoản dịch vụ',
        banned: true,
      });
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

  // 3. Đăng nhập bằng Google
  async googleLogin(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token Google không hợp lệ!');
      }

      const { email, name, picture } = payload;

      // Tìm user theo email trong database bằng Prisma
      let user = await this.prisma.users.findUnique({
        where: { email },
      });

      // Nếu lần đầu đăng nhập thì tự động tạo tài khoản mới
      if (!user) {
        user = await this.prisma.users.create({
          data: {
            email,
            full_name: name || 'Google User',
            avatar: picture || null,
            role: 'renter',
            is_active: true, // Email Google đã được xác thực sẵn
            password: '', // Mật khẩu rỗng cho tài khoản OAuth
          },
        });
      }

      // Chặn đăng nhập nếu tài khoản bị khóa
      if ((user as any).is_banned) {
        throw new ForbiddenException({
          message: 'Tài khoản của bạn đã bị khóa.',
          reason: (user as any).ban_reason || 'Vi phạm điều khoản dịch vụ',
          banned: true,
        });
      }

      // Tạo Access Token JWT đồng bộ với hàm login thường
      const jwtPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(jwtPayload);

      const { password, verification_token, ...userInfo } = user;

      return {
        message: 'Đăng nhập Google thành công',
        access_token: accessToken,
        user: userInfo,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Xác thực Google thất bại!');
    }
  }

  // 4. Kích hoạt tài khoản bằng Token
  async verifyEmail(token: string) {
    const user = await this.prisma.users.findFirst({
      where: { verification_token: token },
    });

    if (!user) {
      throw new BadRequestException(
        'Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.',
      );
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

  // 5. Quên mật khẩu
  async forgotPassword(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) {
      // Trả về thông báo chung để bảo mật thông tin người dùng
      return {
        message:
          'Nếu email tồn tại trong hệ thống, mật khẩu mới sẽ được gửi.',
      };
    }

    const tempPasswordHex = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPasswordHex, 10);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.mailService.sendForgotPasswordEmail(email, tempPasswordHex);
    return { message: 'Mật khẩu tạm thời đã được gửi vào email của bạn.' };
  }

  // 6. Đổi mật khẩu
  async changePassword(userId: number, currentPass: string, newPass: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Chặn lỗi crash bcrypt nếu là tài khoản Google (password rỗng/null)
    if (!user.password) {
      throw new BadRequestException(
        'Tài khoản này đăng nhập bằng Google. Không thể đổi mật khẩu theo cách này.',
      );
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.users.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    await this.mailService.sendPasswordChangedSuccessEmail(user.email);
    return { message: 'Đổi mật khẩu thành công' };
  }

  // 7. Cập nhật thông tin cá nhân
  async updateProfile(userId: number, fullName: string, phone?: string) {
    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: { full_name: fullName, phone },
    });
    const { password, verification_token, ...result } = updatedUser;
    return result;
  }
}