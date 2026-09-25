
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('RoomsController Integration', () => {
  let app: INestApplication;

  const mockRoomsService = {
    createRoom: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const request = context.switchToHttp().getRequest();
          request.user = {
            id: 1,
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/rooms should create a room for the authenticated user', async () => {
    const mockRoom = {
      id: 101,
      title: 'Phòng trọ gần Đại học',
      price: 3500000,
      area: 25,
      city: 'HCM',
      district: 'Q1',
      content: 'Phòng đầy đủ tiện nghi',
      thumbnail: null,
      images: ['image1.jpg'],
      amenities: ['wifi', 'parking'],
      user_id: 1,
      status: 'pending',
    };

    mockRoomsService.createRoom.mockResolvedValue(mockRoom);

    const response = await request(app.getHttpServer())
      .post('/api/rooms')
      .send({
        title: 'Phòng trọ gần Đại học',
        price: 3500000,
        area: 25,
        city: 'HCM',
        district: 'Q1',
        content: 'Phòng đầy đủ tiện nghi',
        images: ['image1.jpg'],
        amenities: ['wifi', 'parking'],
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual(mockRoom);

    expect(mockRoomsService.createRoom).toHaveBeenCalledWith(
      {
        title: 'Phòng trọ gần Đại học',
        price: 3500000,
        area: 25,
        city: 'HCM',
        district: 'Q1',
        content: 'Phòng đầy đủ tiện nghi',
        images: ['image1.jpg'],
        amenities: ['wifi', 'parking'],
      },
      1,
    );
  });
});

