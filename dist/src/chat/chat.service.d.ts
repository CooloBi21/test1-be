import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(userId: number): Promise<({
        messages: {
            is_read: boolean;
            created_at: Date | null;
            id: number;
            text: string;
            conversation_id: number;
            sender_id: number;
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
    getUnreadCount(userId: number): Promise<number>;
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
        text: string;
        conversation_id: number;
        sender_id: number;
    })[]>;
    createOrGetConversation(user1Id: number, user2Id: number, roomId?: number): Promise<{
        created_at: Date | null;
        id: number;
        room_id: number | null;
        updated_at: Date | null;
        user_1_id: number;
        user_2_id: number;
    }>;
    saveMessage(conversationId: number, senderId: number, text: string): Promise<{
        sender: {
            id: number;
            full_name: string;
            avatar: string;
        };
    } & {
        is_read: boolean;
        created_at: Date | null;
        id: number;
        text: string;
        conversation_id: number;
        sender_id: number;
    }>;
    markAsRead(conversationId: number, userId: number): Promise<{
        success: boolean;
    }>;
}
