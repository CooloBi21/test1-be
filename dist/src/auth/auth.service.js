"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("./mail.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async register(dto) {
        const existingUser = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email này đã được sử dụng!');
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
                is_active: false,
                verification_token: verificationToken,
            },
        });
        this.mailService
            .sendVerificationEmail(user.email, verificationToken)
            .catch((err) => console.error('Lỗi khi gửi email kích hoạt:', err));
        const { password, verification_token, ...result } = user;
        return {
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản!',
            user: result,
        };
    }
    async login(dto) {
        const user = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác!');
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email của bạn!');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác!');
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
    async verifyEmail(token) {
        const user = await this.prisma.users.findFirst({
            where: { verification_token: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map