import { SupportTicketsService } from './support-tickets.service';
export declare class SupportTicketsController {
    private readonly ticketsService;
    constructor(ticketsService: SupportTicketsService);
    createTicket(req: any, body: {
        category: any;
        message: string;
    }): Promise<{
        created_at: Date;
        id: number;
        user_id: number;
        status: import(".prisma/client").$Enums.TicketStatus;
        updated_at: Date;
        category: import(".prisma/client").$Enums.TicketCategory;
        message: string;
        admin_reply: string | null;
    }>;
    getMyTickets(req: any): Promise<{
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
    replyTicket(id: number, body: {
        admin_reply: string;
        status: any;
    }): Promise<{
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
