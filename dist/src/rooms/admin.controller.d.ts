import { RoomsService } from '../rooms/rooms.service';
export declare class UpdateRoomStatusDto {
    status: 'approved' | 'rejected';
}
export declare class AdminController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    getAllRoomsForAdmin(): Promise<{
        total: number;
        data: any[];
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
}
