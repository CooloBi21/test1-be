import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SupportTicketsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createTicket(userId: number, category: any, message: string): Promise<{
        created_at: Date;
        id: number;
        user_id: number;
        status: import(".prisma/client").$Enums.TicketStatus;
        updated_at: Date;
        category: import(".prisma/client").$Enums.TicketCategory;
        message: string;
        admin_reply: string | null;
    }>;
    getUserTickets(userId: number): Promise<{
        created_at: Date;
        id: number;
        user_id: number;
        status: import(".prisma/client").$Enums.TicketStatus;
        updated_at: Date;
        category: import(".prisma/client").$Enums.TicketCategory;
        message: string;
        admin_reply: string | null;
    }[]>;
    getAdminTickets(status?: any): Promise<({
        user: {
            id: number;
            full_name: string;
            email: string;
        };
    } & {
        created_at: Date;
        id: number;
        user_id: number;
        status: import(".prisma/client").$Enums.TicketStatus;
        updated_at: Date;
        category: import(".prisma/client").$Enums.TicketCategory;
        message: string;
        admin_reply: string | null;
    })[]>;
    replyTicket(id: number, admin_reply: string, status: any): Promise<{
        created_at: Date;
        id: number;
        user_id: number;
        status: import(".prisma/client").$Enums.TicketStatus;
        updated_at: Date;
        category: import(".prisma/client").$Enums.TicketCategory;
        message: string;
        admin_reply: string | null;
    }>;
}
