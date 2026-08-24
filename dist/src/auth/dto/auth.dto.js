"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileDto = exports.ChangePasswordDto = exports.ForgotPasswordDto = exports.LoginDto = exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nguyễn Văn A', description: 'Họ và tên người dùng' }),
    (0, class_validator_1.IsString)({ message: 'Họ và tên phải là chuỗi ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@gmail.com', description: 'Email đăng ký' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không đúng định dạng' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Mật khẩu tối thiểu 6 ký tự' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0987654321', required: false, description: 'Số điện thoại' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@gmail.com', description: 'Email đăng nhập' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không đúng định dạng' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Mật khẩu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được để trống' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@gmail.com', description: 'Email nhận mật khẩu tạm thời' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không đúng định dạng' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Mật khẩu hiện tại' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu hiện tại không được để trống' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "current_password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'newpassword123', description: 'Mật khẩu mới (tối thiểu 6 ký tự)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu mới không được để trống' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "new_password", void 0);
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nguyễn Văn A', description: 'Họ và tên mới' }),
    (0, class_validator_1.IsString)({ message: 'Họ và tên phải là chuỗi ký tự' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên không được để trống' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0987654321', required: false, description: 'Số điện thoại' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
//# sourceMappingURL=auth.dto.js.map