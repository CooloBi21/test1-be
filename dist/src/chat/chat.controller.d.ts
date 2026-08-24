import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<({
        messages: {
            is_read: boolean;
            created_at: Date | null;
            id: number;
            conversation_id: number;
            sender_id: number;
            text: string;
        }[];
        room: {
            title: string;
            id: number;
            thumbnail: string;
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
        created_at: Date | null;
        id: number;
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
        is_read: boolean;
        created_at: Date | null;
        id: number;
        conversation_id: number;
        sender_id: number;
        text: string;
    })[]>;
    createOrGetConversation(body: {
        targetUserId: number;
        roomId?: number;
    }, req: any): Promise<{
        created_at: Date | null;
        id: number;
        room_id: number | null;
        updated_at: Date | null;
        user_1_id: number;
        user_2_id: number;
    }>;
    markAsRead(conversationId: number, req: any): Promise<{
        success: boolean;
    }>;
}
