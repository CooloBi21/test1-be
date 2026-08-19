import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleJoinUser(userId: number, client: Socket): void;
    handleSendMessage(payload: {
        conversationId: number;
        senderId: number;
        recipientId: number;
        text: string;
    }): Promise<void>;
}
