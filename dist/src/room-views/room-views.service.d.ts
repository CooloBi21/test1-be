import { PrismaService } from '../prisma/prisma.service';
export declare class RoomViewsService {
    private prisma;
    constructor(prisma: PrismaService);
    recordView(userId: number, roomId: number): Promise<{
        id: number;
        user_id: number;
        room_id: number;
        viewed_at: Date | null;
    }>;
    getViewHistory(userId: number): Promise<({
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
    } & {
        id: number;
        user_id: number;
        room_id: number;
        viewed_at: Date | null;
    })[]>;
    clearHistory(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    removeHistoryItem(userId: number, roomId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
