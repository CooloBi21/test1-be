import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Kiểm tra lại đường dẫn import JwtAuthGuard

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Route: GET /api/chat/conversations
  @Get('conversations')
  getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  // Route: GET /api/chat/unread-count
  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  // Route: GET /api/chat/messages/:conversationId
  @Get('messages/:conversationId')
  getMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
    return this.chatService.getMessages(conversationId);
  }

  // Route: POST /api/chat/conversations
  @Post('conversations')
  createOrGetConversation(
    @Body() body: { targetUserId: number; roomId?: number },
    @Request() req,
  ) {
    return this.chatService.createOrGetConversation(req.user.id, body.targetUserId, body.roomId);
  }

  // Route: POST /api/chat/read/:conversationId
  @Post('read/:conversationId')
  markAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Request() req,
  ) {
    return this.chatService.markAsRead(conversationId, req.user.id);
  }
}