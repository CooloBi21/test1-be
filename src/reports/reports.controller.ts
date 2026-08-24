import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // User gửi báo cáo (Cần JWT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createReport(@Request() req, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(req.user.id, dto);
  }

  // Admin lấy danh sách báo cáo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Get('admin')
  async getAllReports() {
    return this.reportsService.getAllReportsForAdmin();
  }

  // Admin xử lý báo cáo (Khóa/Bỏ qua)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Patch('admin/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'resolved' | 'dismissed',
  ) {
    return this.reportsService.updateReportStatus(id, status);
  }
}