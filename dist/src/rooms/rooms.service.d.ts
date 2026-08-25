import { Pool } from 'pg';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
export declare class RoomsService {
    private readonly pool;
    private readonly prisma;
    private readonly notificationsService;
    constructor(pool: Pool, prisma: PrismaService, notificationsService: NotificationsService);
    getRooms(filterDto: GetRoomsFilterDto & {
        userId?: number;
    }): Promise<{
        total: number;
        data: any[];
    }>;
    getRoomById(id: string): Promise<void>;
}
