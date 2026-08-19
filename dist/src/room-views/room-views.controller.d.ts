import { RoomViewsService } from './room-views.service';
export declare class RoomViewsController {
    private readonly roomViewsService;
    constructor(roomViewsService: RoomViewsService);
    recordView(req: any, roomId: number): Promise<{
        id: number;
        user_id: number;
        room_id: number;
        viewed_at: Date | null;
    }>;
    getViewHistory(req: any): any[] | Promise<({
        room: {
            content: string | null;
            title: string;
            id: number;
            user_id: number | null;
            city: string;
            district: string;
            thumbnail: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        user_id: number;
        room_id: number;
        viewed_at: Date | null;
    })[]>;
    clearHistory(req: any): Promise<import(".prisma/client").Prisma.BatchPayload> | {
        success: boolean;
    };
    removeHistoryItem(req: any, roomId: number): Promise<import(".prisma/client").Prisma.BatchPayload> | {
        success: boolean;
    };
}
