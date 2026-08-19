import { Server } from 'socket.io';
export declare class NotificationsGateway {
    server: Server;
    emitNewNotification(userId: number, notification: any): void;
    emitUnreadCount(userId: number, unreadCount: number): void;
}
