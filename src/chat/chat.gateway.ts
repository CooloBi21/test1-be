import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Lắng nghe sự kiện User kết nối vào room cá nhân
  @SubscribeMessage('joinUser')
  handleJoinUser(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    client.join(`user_${userId}`);
  }

  // Lắng nghe khi gửi tin nhắn
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: { conversationId: number; senderId: number; recipientId: number; text: string },
  ) {
    // 1. Lưu DB
    const message = await this.chatService.saveMessage(
      payload.conversationId,
      payload.senderId,
      payload.text,
    );

    // 2. Phát tin nhắn tức thì cho người gửi & người nhận
    this.server.to(`user_${payload.recipientId}`).emit('newMessage', message);
    this.server.to(`user_${payload.senderId}`).emit('newMessage', message);

    // 3. Cập nhật số tin nhắn chưa đọc cho người nhận
    const unreadCount = await this.chatService.getUnreadCount(payload.recipientId);
    this.server.to(`user_${payload.recipientId}`).emit('unreadCountUpdate', unreadCount);
  }
}