import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationInput {
  user_id: number;
  type: string;
  title: string;
  body?: string;
  target_url?: string;
  entity_type?: string;
  entity_id?: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(data: CreateNotificationInput) {
    // 1. Tạo 1 bản ghi duy nhất trong DB
    const notification = await this.prisma.notifications.create({
      data: {
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        body: data.body,
        target_url: data.target_url,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
      },
    });

    // 2. Lấy lại số lượng chưa đọc mới nhất
    const unreadCount = await this.getUnreadCount(data.user_id);

    // 3. Emit realtime qua Socket.IO (Chỉ phát 1 lần cho client)
    this.notificationsGateway.emitNewNotification(data.user_id, notification);
    this.notificationsGateway.emitUnreadCount(data.user_id, unreadCount);

    return notification;
  }

  async getNotifications(userId: number) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    const noti = await this.prisma.notifications.updateMany({
      where: { id: notificationId, user_id: userId, is_read: false },
      data: { is_read: true },
    });
    
    if (noti.count > 0) {
      const unreadCount = await this.getUnreadCount(userId);
      this.notificationsGateway.emitUnreadCount(userId, unreadCount);
    }
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    
    this.notificationsGateway.emitUnreadCount(userId, 0);
    return { success: true };
  }
}