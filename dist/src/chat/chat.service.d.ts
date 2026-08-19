import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(userId: number): Promise<({
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
    getUnreadCount(userId: number): Promise<number>;
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
    createOrGetConversation(user1Id: number, user2Id: number, roomId?: number): Promise<{
        id: number;
        created_at: Date | null;
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
        id: number;
        created_at: Date | null;
        conversation_id: number;
        sender_id: number;
        text: string;
        is_read: boolean;
    }>;
    markAsRead(conversationId: number, userId: number): Promise<{
        success: boolean;
    }>;
}
