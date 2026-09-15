import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      conversations: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      messages: {
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    service = new ChatService(prisma);
  });

  describe('getConversations', () => {
    it('should return conversations for the specified user', async () => {
      const conversations = [
        {
          id: 1,
          user_1_id: 10,
          user_2_id: 20,
        },
      ];

      prisma.conversations.findMany.mockResolvedValue(conversations);

      await expect(
        service.getConversations(10),
      ).resolves.toEqual(conversations);

      expect(
        prisma.conversations.findMany,
      ).toHaveBeenCalledWith({
        where: {
          OR: [{ user_1_id: 10 }, { user_2_id: 10 }],
        },
        include: {
          user1: {
            select: {
              id: true,
              full_name: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              full_name: true,
              avatar: true,
            },
          },
          room: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
            },
          },
          messages: {
            take: 1,
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread messages sent by other users', async () => {
      prisma.messages.count.mockResolvedValue(3);

      await expect(
        service.getUnreadCount(10),
      ).resolves.toBe(3);

      expect(
        prisma.messages.count,
      ).toHaveBeenCalledWith({
        where: {
          is_read: false,
          sender_id: {
            not: 10,
          },
          conversation: {
            OR: [{ user_1_id: 10 }, { user_2_id: 10 }],
          },
        },
      });
    });
  });

  describe('getMessages', () => {
    it('should return messages for the specified conversation in ascending order', async () => {
      const messages = [
        {
          id: 1,
          conversation_id: 100,
          text: 'Hello',
        },
        {
          id: 2,
          conversation_id: 100,
          text: 'Hi',
        },
      ];

      prisma.messages.findMany.mockResolvedValue(messages);

      await expect(
        service.getMessages(100),
      ).resolves.toEqual(messages);

      expect(
        prisma.messages.findMany,
      ).toHaveBeenCalledWith({
        where: {
          conversation_id: 100,
        },
        include: {
          sender: {
            select: {
              id: true,
              full_name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    });
  });

  describe('createOrGetConversation', () => {
    it('should reject when a user tries to chat with themselves', async () => {
      await expect(
        service.createOrGetConversation(10, 10),
      ).rejects.toThrow('Không thể nhắn tin với chính mình');

      expect(
        prisma.conversations.findFirst,
      ).not.toHaveBeenCalled();

      expect(
        prisma.conversations.create,
      ).not.toHaveBeenCalled();
    });

    it('should return the existing conversation', async () => {
      const conversation = {
        id: 100,
        user_1_id: 10,
        user_2_id: 20,
        room_id: null,
      };

      prisma.conversations.findFirst.mockResolvedValue(
        conversation,
      );

      await expect(
        service.createOrGetConversation(10, 20),
      ).resolves.toEqual(conversation);

      expect(
        prisma.conversations.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              user_1_id: 10,
              user_2_id: 20,
              room_id: null,
            },
            {
              user_1_id: 20,
              user_2_id: 10,
              room_id: null,
            },
          ],
        },
      });

      expect(
        prisma.conversations.create,
      ).not.toHaveBeenCalled();
    });

    it('should create a new conversation when none exists', async () => {
      const conversation = {
        id: 101,
        user_1_id: 10,
        user_2_id: 20,
        room_id: 5,
      };

      prisma.conversations.findFirst.mockResolvedValue(
        null,
      );

      prisma.conversations.create.mockResolvedValue(
        conversation,
      );

      await expect(
        service.createOrGetConversation(10, 20, 5),
      ).resolves.toEqual(conversation);

      expect(
        prisma.conversations.create,
      ).toHaveBeenCalledWith({
        data: {
          user_1_id: 10,
          user_2_id: 20,
          room_id: 5,
        },
      });
    });
  });

  describe('saveMessage', () => {
    it('should save the message with sender information and return the created message', async () => {
      const message = {
        id: 200,
        conversation_id: 100,
        sender_id: 10,
        text: 'Hello',
        sender: {
          id: 10,
          full_name: 'User 10',
          avatar: 'avatar.jpg',
        },
      };

      prisma.messages.create.mockResolvedValue(message);

      await expect(
        service.saveMessage(100, 10, 'Hello'),
      ).resolves.toEqual(message);

      expect(
        prisma.messages.create,
      ).toHaveBeenCalledWith({
        data: {
          conversation_id: 100,
          sender_id: 10,
          text: 'Hello',
        },
        include: {
          sender: {
            select: {
              id: true,
              full_name: true,
              avatar: true,
            },
          },
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark unread messages from other users as read', async () => {
      prisma.messages.updateMany.mockResolvedValue({
        count: 2,
      });

      await expect(
        service.markAsRead(100, 10),
      ).resolves.toEqual({
        success: true,
      });

      expect(
        prisma.messages.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          conversation_id: 100,
          sender_id: {
            not: 10,
          },
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });
    });
  });
});