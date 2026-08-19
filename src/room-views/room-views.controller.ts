import { Controller, Post, Get, Delete, Param, Body, Req, ParseIntPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { RoomViewsService } from './room-views.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/room-views')
export class RoomViewsController {
  constructor(private readonly roomViewsService: RoomViewsService) {}

  @Post()
  recordView(@Req() req, @Body('room_id', ParseIntPipe) roomId: number) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Chưa xác thực người dùng');
    return this.roomViewsService.recordView(userId, roomId);
  }

  @Get()
  getViewHistory(@Req() req) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.roomViewsService.getViewHistory(userId);
  }

  @Delete()
  clearHistory(@Req() req) {
    const userId = req.user?.id;
    if (!userId) return { success: true };
    return this.roomViewsService.clearHistory(userId);
  }

  @Delete(':room_id')
  removeHistoryItem(@Req() req, @Param('room_id', ParseIntPipe) roomId: number) {
    const userId = req.user?.id;
    if (!userId) return { success: true };
    return this.roomViewsService.removeHistoryItem(userId, roomId);
  }
}