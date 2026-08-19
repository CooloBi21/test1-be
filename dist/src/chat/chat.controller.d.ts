import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<({
        messages: {
            id: number;
            created_at: Date | null;
            conversation_id: number;
            sender_id: number;
            text: string;
            is_read: boolean;
        }[];
        room: {
            title: string;
            thumbnail: string;
            id: number;
        };
        user1: {
            id: number;
            full_name: string;
            avatar: string;
        };
        user2: {
            id: number;
            full_name: string;
            avatar: string;
        };
    } & {
        id: number;
        created_at: Date | null;
        room_id: number | null;
        updated_at: Date | null;
        user_1_id: number;
        user_2_id: number;
    })[]>;
    getUnreadCount(req: any): Promise<number>;
    getMessages(conversationId: number): Promise<({
        sender: {
            id: number;
            full_name: string;
            avatar: string;
        };
    } & {
        id: number;
        created_at: Date | null;
        conversation_id: number;
        sender_id: number;
        text: string;
        is_read: boolean;
    })[]>;
    createOrGetConversation(body: {
        targetUserId: number;
        roomId?: number;
    }, req: any): Promise<{
        id: number;
        created_at: Date | null;
        room_id: number | null;
        updated_at: Date | null;
        user_1_id: number;
        user_2_id: number;
    }>;
    markAsRead(conversationId: number, req: any): Promise<{
        success: boolean;
    }>;
}
