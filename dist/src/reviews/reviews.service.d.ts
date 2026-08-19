import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    upsertReview(userId: number, roomId: number, rating: number, comment?: string): Promise<{
        id: number;
        created_at: Date | null;
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
            city: string;
            district: string;
            thumbnail: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            id: number;
            user_id: number | null;
        };
    } & {
        id: number;
        created_at: Date | null;
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
            city: string;
            district: string;
            thumbnail: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            id: number;
            user_id: number | null;
        };
    } & {
        id: number;
        created_at: Date | null;
        user_id: number;
        room_id: number;
        rating: number;
        comment: string | null;
        updated_at: Date | null;
    })[]>;
    deleteReview(userId: number, reviewId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
