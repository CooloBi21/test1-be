import { Pool } from 'pg';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
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
    getRoomById(id: string): Promise<any>;
    createRoom(dto: CreateRoomDto, userId?: number): Promise<any>;
    updateRoom(id: string, dto: UpdateRoomDto, currentUserId: number): Promise<{
        data: any;
        changes: {
            field: string;
            oldValue: any;
            newValue: any;
        }[];
    }>;
    updateRoomStatus(id: number, status: 'approved' | 'rejected'): Promise<{
        message: string;
        room: {
            content: string | null;
            title: string;
            id: number;
            user_id: number | null;
            thumbnail: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            city: string;
            district: string;
            status: import(".prisma/client").$Enums.RoomStatus | null;
        };
    }>;
    deleteRoom(id: string, currentUserId: number): Promise<{
        message: string;
        data: any;
    }>;
}
