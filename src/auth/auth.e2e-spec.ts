import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController Integration', () => {
  let app: INestApplication;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/login should return user data and set httpOnly access_token cookie', async () => {
    mockAuthService.login.mockResolvedValue({
      message: 'ăng nhập th� nh công',
      access_token: 'test-access-token',
      user: {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'renter',
        is_active: true,
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        access_token: 'test-access-token',
        user: expect.objectContaining({
          id: 1,
          email: 'test@example.com',
          role: 'renter',
        }),
      }),
    );

    const setCookie = response.headers['set-cookie'];

    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toContain('access_token=test-access-token'); 
    expect(setCookie[0].toLowerCase()).toContain('httponly');

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });
});
