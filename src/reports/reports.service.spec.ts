import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      rooms: {
        findUnique: jest.fn(),
      },
      reports: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new ReportsService(prisma);
  });

  describe('createReport', () => {
    it('should reject when the reported room does not exist', async () => {
      prisma.rooms.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport(10, {
          room_id: 101,
          reason: 'Thông tin phòng không chính xác',
        }),
      ).rejects.toThrow(
        new NotFoundException('Phòng trọ không tồn tại'),
      );

      expect(prisma.reports.create).not.toHaveBeenCalled();
    });

    it('should create a report when the reported room exists', async () => {
      prisma.rooms.findUnique.mockResolvedValue({
        id: 101,
      });

      const createdReport = {
        id: 1,
        room_id: 101,
        reporter_id: 10,
        reason: 'Thông tin phòng không chính xác',
      };

      prisma.reports.create.mockResolvedValue(createdReport);

      await expect(
        service.createReport(10, {
          room_id: 101,
          reason: 'Thông tin phòng không chính xác',
        }),
      ).resolves.toEqual(createdReport);

      expect(prisma.rooms.findUnique).toHaveBeenCalledWith({
        where: { id: 101 },
      });

      expect(prisma.reports.create).toHaveBeenCalledWith({
        data: {
          room_id: 101,
          reporter_id: 10,
          reason: 'Thông tin phòng không chính xác',
        },
      });
    });
  });

  describe('getAllReportsForAdmin', () => {
    it('should return all reports with room and reporter information ordered by newest first', async () => {
      const reports = [
        {
          id: 2,
          room: {
            id: 101,
            title: 'Phòng trọ A',
          },
          reporter: {
            id: 10,
            full_name: 'Người dùng A',
            email: 'user-a@example.com',
          },
        },
      ];

      prisma.reports.findMany.mockResolvedValue(reports);

      await expect(service.getAllReportsForAdmin()).resolves.toEqual(
        reports,
      );

      expect(prisma.reports.findMany).toHaveBeenCalledWith({
        include: {
          room: {
            select: {
              id: true,
              title: true,
            },
          },
          reporter: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });
  });

  describe('updateReportStatus', () => {
    it('should reject when the report does not exist', async () => {
      prisma.reports.findUnique.mockResolvedValue(null);

      await expect(
        service.updateReportStatus(999, 'resolved'),
      ).rejects.toThrow(
        new NotFoundException('Không tìm thấy báo cáo'),
      );

      expect(prisma.reports.update).not.toHaveBeenCalled();
    });

    it('should update the report status when the report exists', async () => {
      prisma.reports.findUnique.mockResolvedValue({
        id: 999,
        status: 'pending',
      });

      const updatedReport = {
        id: 999,
        status: 'resolved',
      };

      prisma.reports.update.mockResolvedValue(updatedReport);

      await expect(
        service.updateReportStatus(999, 'resolved'),
      ).resolves.toEqual(updatedReport);

      expect(prisma.reports.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      expect(prisma.reports.update).toHaveBeenCalledWith({
        where: { id: 999 },
        data: {
          status: 'resolved',
        },
      });
    });
  });
});