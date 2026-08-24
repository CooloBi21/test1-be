import { PrismaService } from '../prisma/prisma.service';
export declare class SavedPostsService {
    private prisma;
    constructor(prisma: PrismaService);
    toggleSave(userId: number, roomId: number): Promise<{
        saved: boolean;
    }>;
    checkSaved(userId: number, roomId: number): Promise<boolean>;
    getUserSavedPosts(userId: number): Promise<({
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
        created_at: Date | null;
        id: number;
        user_id: number;
        room_id: number;
    })[]>;
}
