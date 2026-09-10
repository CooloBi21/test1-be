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

describe('AuthService - googleLogin', () => {
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

  it('should login successfully when Google token is valid and user exists', async () => {
    const verifyIdTokenMock = jest
      .spyOn((service as any).googleClient, 'verifyIdToken')
      .mockResolvedValue({
        getPayload: () => ({
          email: 'google@example.com',
          name: 'Google User',
          picture: 'https://example.com/avatar.jpg',
        }),
      } as any);

    prismaMock.users.findUnique.mockResolvedValue({
      id: 10,
      email: 'google@example.com',
      full_name: 'Google User',
      avatar: 'https://example.com/avatar.jpg',
      role: 'renter',
      is_active: true,
      is_banned: false,
      password: '',
      verification_token: null,
    });

    jwtServiceMock.sign.mockReturnValue('google-access-token');

    const result = await service.googleLogin('valid-google-token');

    expect(verifyIdTokenMock).toHaveBeenCalledWith({
      idToken: 'valid-google-token',
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    expect(prismaMock.users.findUnique).toHaveBeenCalledWith({
      where: { email: 'google@example.com' },
    });

    expect(prismaMock.users.create).not.toHaveBeenCalled();

    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: 10,
      email: 'google@example.com',
      role: 'renter',
    });

    expect(result).toEqual(
      expect.objectContaining({
        message: 'Đăng nhập Google thành công',
        access_token: 'google-access-token',
      }),
    );

    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('verification_token');

    verifyIdTokenMock.mockRestore();
  });

  it('should create a new user when Google account does not exist', async () => {
    jest
      .spyOn((service as any).googleClient, 'verifyIdToken')
      .mockResolvedValue({
        getPayload: () => ({
          email: 'newgoogle@example.com',
          name: 'New Google User',
          picture: 'https://example.com/new-avatar.jpg',
        }),
      } as any);

    prismaMock.users.findUnique.mockResolvedValue(null);

    prismaMock.users.create.mockResolvedValue({
      id: 20,
      email: 'newgoogle@example.com',
      full_name: 'New Google User',
      avatar: 'https://example.com/new-avatar.jpg',
      role: 'renter',
      is_active: true,
      password: '',
      verification_token: null,
      is_banned: false,
    });

    jwtServiceMock.sign.mockReturnValue('new-google-access-token');

    const result = await service.googleLogin('new-google-token');

    expect(prismaMock.users.create).toHaveBeenCalledWith({
      data: {
        email: 'newgoogle@example.com',
        full_name: 'New Google User',
        avatar: 'https://example.com/new-avatar.jpg',
        role: 'renter',
        is_active: true,
        password: '',
      },
    });

    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: 20,
      email: 'newgoogle@example.com',
      role: 'renter',
    });

    expect(result).toEqual(
      expect.objectContaining({
        message: 'Đăng nhập Google thành công',
        access_token: 'new-google-access-token',
      }),
    );

    jest.restoreAllMocks();
  });

  it('should reject Google login when account is banned', async () => {
    jest
      .spyOn((service as any).googleClient, 'verifyIdToken')
      .mockResolvedValue({
        getPayload: () => ({
          email: 'bannedgoogle@example.com',
          name: 'Banned Google User',
        }),
      } as any);

    prismaMock.users.findUnique.mockResolvedValue({
      id: 30,
      email: 'bannedgoogle@example.com',
      full_name: 'Banned Google User',
      role: 'renter',
      is_active: true,
      is_banned: true,
      ban_reason: 'Test ban',
      password: '',
    });

    await expect(
      service.googleLogin('banned-google-token'),
    ).rejects.toThrow(ForbiddenException);

    expect(jwtServiceMock.sign).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should reject Google login when token verification fails', async () => {
    jest
      .spyOn((service as any).googleClient, 'verifyIdToken')
      .mockRejectedValue(new Error('Invalid Google token'));

    await expect(
      service.googleLogin('invalid-google-token'),
    ).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.users.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.users.create).not.toHaveBeenCalled();
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});

describe('AuthService - verifyEmail', () => {
  let service: AuthService;

  const prismaMock = {
    users: {
      findFirst: jest.fn(),
      update: jest.fn(),
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

  it('should reject verification when token is invalid', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);

    await expect(
      service.verifyEmail('invalid-token'),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.users.update).not.toHaveBeenCalled();
  });

  it('should activate user and clear verification token', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      id: 100,
      email: 'user@example.com',
      verification_token: 'valid-token',
      is_active: false,
    });

    prismaMock.users.update.mockResolvedValue({
      id: 100,
      is_active: true,
      verification_token: null,
    });

    const result = await service.verifyEmail('valid-token');

    expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
      where: {
        verification_token: 'valid-token',
      },
    });

    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: {
        id: 100,
      },
      data: {
        is_active: true,
        verification_token: null,
      },
    });

    expect(result).toEqual({
      message: 'Xác thực email thành công! Bạn đã có thể đăng nhập.',
    });
  });
});
