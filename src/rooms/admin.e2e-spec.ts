import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AdminController } from './admin.controller';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('AdminController Integration', () => {
  let app: INestApplication;

  const mockRoomsService = {
    updateRoomStatus: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
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
            role: 'admin',
          };

          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(PermissionsGuard)
      .useValue({
        canActivate: () => true,
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

  it('PUT /api/admin/rooms/:id/status should update room status', async () => {
    const mockResult = {
      message: 'Đã cập nhật trạng thái phòng thành approved',
      room: {
        id: 101,
        status: 'approved',
      },
    };

    mockRoomsService.updateRoomStatus.mockResolvedValue(mockResult);

    const response = await request(app.getHttpServer())
      .put('/api/admin/rooms/101/status')
      .send({
        status: 'approved',
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(mockResult);

    expect(mockRoomsService.updateRoomStatus).toHaveBeenCalledWith(
      101,
      'approved',
    );
  });
});
