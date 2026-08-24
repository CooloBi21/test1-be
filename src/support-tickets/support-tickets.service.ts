import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportTicketsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createTicket(userId: number, category: any, message: string) {
    return this.prisma.support_tickets.create({
      data: { user_id: userId, category, message },
    });
  }

  async getUserTickets(userId: number) {
    return this.prisma.support_tickets.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAdminTickets(status?: any) {
    return this.prisma.support_tickets.findMany({
      where: status ? { status } : {},
      include: { user: { select: { id: true, full_name: true, email: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async replyTicket(id: number, admin_reply: string, status: any) {
    const ticket = await this.prisma.support_tickets.update({
      where: { id },
      data: { admin_reply, status },
    });

    await this.notificationsService.createNotification({
      user_id: ticket.user_id,
      type: 'system',
      title: 'Phản hồi khiếu nại/hỗ trợ',
      body: `Admin đã phản hồi ticket #${ticket.id} của bạn: "${admin_reply.substring(0, 40)}..."`,
      target_url: '/support',
      entity_type: 'ticket',
      entity_id: ticket.id,
    });

    return ticket;
  }
}