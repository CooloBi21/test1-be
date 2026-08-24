import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: number, dto: CreateReportDto) {
    const room = await this.prisma.rooms.findUnique({ where: { id: dto.room_id } });
    if (!room) throw new NotFoundException('Phòng trọ không tồn tại');

    return this.prisma.reports.create({
      data: {
        room_id: dto.room_id,
        reporter_id: reporterId,
        reason: dto.reason,
      },
    });
  }

  async getAllReportsForAdmin() {
    return this.prisma.reports.findMany({
      include: {
        room: { select: { id: true, title: true } },
        reporter: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateReportStatus(reportId: number, status: 'resolved' | 'dismissed') {
    const report = await this.prisma.reports.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Không tìm thấy báo cáo');

    return this.prisma.reports.update({
      where: { id: reportId },
      data: { status },
    });
  }
}