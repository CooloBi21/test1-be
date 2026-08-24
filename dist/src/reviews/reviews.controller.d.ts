import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    submitReview(req: any, roomId: number, rating: number, comment: string): Promise<{
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
    getMyReviews(req: any): Promise<({
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
    getReviewsAboutMe(req: any): Promise<({
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
    deleteReview(req: any, reviewId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
