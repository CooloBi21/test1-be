import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService - register', () => {
  let service: AuthService;

  const prismaMock = {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  const mailServiceMock = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(
      prismaMock as any,
      jwtServiceMock as any,
      mailServiceMock as any,
    );
  });

  it('should reject registration when email already exists', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 1,
      email: 'existing@example.com',
    });

    await expect(
      service.register({
        email: 'existing@example.com',
        password: 'Password123',
        full_name: 'Test User',
        phone: '0123456789',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.users.create).not.toHaveBeenCalled();
    expect(mailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should create a renter account and send verification email', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);

    prismaMock.users.create.mockResolvedValue({
      id: 1,
      email: 'new@example.com',
      full_name: 'Test User',
      password: 'hashed-password',
      phone: '0123456789',
      role: 'renter',
      is_active: false,
      verification_token: 'verification-token',
    });

    mailServiceMock.sendVerificationEmail.mockResolvedValue(undefined);

    const result = await service.register({
      email: 'new@example.com',
      password: 'Password123',
      full_name: 'Test User',
      phone: '0123456789',
    });

    expect(prismaMock.users.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          full_name: 'Test User',
          phone: '0123456789',
          role: 'renter',
          is_active: false,
        }),
      }),
    );

    expect(mailServiceMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(mailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      'new@example.com',
      expect.any(String),
    );

    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('verification_token');
  });
});

describe('AuthService - login', () => {
  let service: AuthService;

  const prismaMock = {
    users: {
      findUnique: jest.fn(),
    },
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  const mailServiceMock = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(
      prismaMock as any,
      jwtServiceMock as any,
      mailServiceMock as any,
    );
  });

  it('should reject login when user does not exist', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'notfound@example.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should reject login when user is banned', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 1,
      email: 'banned@example.com',
      password: 'hashed-password',
      role: 'renter',
      is_active: true,
      is_banned: true,
      ban_reason: 'Test ban',
    });

    await expect(
      service.login({
        email: 'banned@example.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should reject login when account is not active', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 1,
      email: 'inactive@example.com',
      password: 'hashed-password',
      role: 'renter',
      is_active: false,
      is_banned: false,
    });

    await expect(
      service.login({
        email: 'inactive@example.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should reject login when password is incorrect', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'renter',
      is_active: true,
      is_banned: false,
    });

    const bcrypt = require('bcrypt');

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'WrongPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'WrongPassword123',
      'hashed-password',
    );

    expect(jwtServiceMock.sign).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'renter',
      is_active: true,
      is_banned: false,
      full_name: 'Test User',
      phone: '0123456789',
      verification_token: null,
    });

    jwtServiceMock.sign.mockReturnValue('test-access-token');

    const bcrypt = require('bcrypt');

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await service.login({
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'Password123',
      'hashed-password',
    );

    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: 1,
      email: 'user@example.com',
      role: 'renter',
    });

    expect(result).toEqual(
      expect.objectContaining({
        message: 'Đăng nhập thành công',
        access_token: 'test-access-token',
      }),
    );

    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('verification_token');

    jest.restoreAllMocks();
  });
});
