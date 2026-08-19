import { Controller, Post, Get, Param, Body, Req, ParseIntPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/saved-posts')
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) {}

  @Post()
  toggleSave(@Req() req, @Body('room_id', ParseIntPipe) roomId: number) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Chưa xác thực người dùng');
    return this.savedPostsService.toggleSave(userId, roomId);
  }

  @Get()
  getSavedPosts(@Req() req) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.savedPostsService.getUserSavedPosts(userId);
  }

  @Get('check/:room_id')
  checkSaved(@Req() req, @Param('room_id', ParseIntPipe) roomId: number) {
    const userId = req.user?.id;
    if (!userId) return false;
    return this.savedPostsService.checkSaved(userId, roomId);
  }
}