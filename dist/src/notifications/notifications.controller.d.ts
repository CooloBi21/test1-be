import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
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
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAsRead(req: any, id: string): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
}
