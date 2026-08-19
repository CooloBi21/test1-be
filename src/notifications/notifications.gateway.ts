import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Emit sự kiện có thông báo mới
  emitNewNotification(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('newNotification', notification);
  }

  // Emit sự kiện cập nhật tổng số thông báo chưa đọc
  emitUnreadCount(userId: number, unreadCount: number) {
    this.server.to(`user_${userId}`).emit('unreadNotiCountUpdate', unreadCount);
  }
}