import { SavedPostsService } from './saved-posts.service';
export declare class SavedPostsController {
    private readonly savedPostsService;
    constructor(savedPostsService: SavedPostsService);
    toggleSave(req: any, roomId: number): Promise<{
        saved: boolean;
    }>;
    getSavedPosts(req: any): any[] | Promise<({
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
    })[]>;
    checkSaved(req: any, roomId: number): false | Promise<boolean>;
}
