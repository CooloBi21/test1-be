import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReviewsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    upsertReview(userId: number, roomId: number, rating: number, comment?: string): Promise<{
        user: {
            full_name: string;
        };
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
        rating: number;
        comment: string | null;
        updated_at: Date | null;
    }>;
    getMyReviews(userId: number): Promise<({
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
        rating: number;
        comment: string | null;
        updated_at: Date | null;
    })[]>;
    getReviewsAboutMe(userId: number): Promise<({
        user: {
            full_name: string;
            avatar: string;
        };
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
        rating: number;
        comment: string | null;
        updated_at: Date | null;
    })[]>;
    deleteReview(userId: number, reviewId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
