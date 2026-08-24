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
export declare class NotificationsService {
    private readonly prisma;
    private readonly notificationsGateway;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway);
    createNotification(data: CreateNotificationInput): Promise<{
        type: string;
        title: string;
        body: string | null;
        target_url: string | null;
        entity_type: string | null;
        entity_id: number | null;
        is_read: boolean;
        created_at: Date | null;
        id: number;
        user_id: number;
    }>;
    getNotifications(userId: number): Promise<{
        type: string;
        title: string;
        body: string | null;
        target_url: string | null;
        entity_type: string | null;
        entity_id: number | null;
        is_read: boolean;
        created_at: Date | null;
        id: number;
        user_id: number;
    }[]>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(userId: number, notificationId: number): Promise<{
        success: boolean;
    }>;
    markAllAsRead(userId: number): Promise<{
        success: boolean;
    }>;
}
