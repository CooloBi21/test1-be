import { SupportTicketsService } from './support-tickets.service';

describe('SupportTicketsService', () => {
  let service: SupportTicketsService;
  let prisma: any;
  let notificationsService: any;

  beforeEach(() => {
    prisma = {
      support_tickets: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    notificationsService = {
      createNotification: jest.fn(),
    };

    service = new SupportTicketsService(
      prisma,
      notificationsService,
    );
  });

  describe('createTicket', () => {
    it('should create a support ticket with the correct data', async () => {
      const ticket = {
        id: 1,
        user_id: 10,
        category: 'technical',
        message: 'Không đăng nhập được',
      };

      prisma.support_tickets.create.mockResolvedValue(ticket);

      await expect(
        service.createTicket(
          10,
          'technical',
          'Không đăng nhập được',
        ),
      ).resolves.toEqual(ticket);

      expect(prisma.support_tickets.create).toHaveBeenCalledWith({
        data: {
          user_id: 10,
          category: 'technical',
          message: 'Không đăng nhập được',
        },
      });
    });
  });

  describe('getUserTickets', () => {
    it('should return tickets belonging to the specified user', async () => {
      const tickets = [
        {
          id: 2,
          user_id: 10,
          message: 'Ticket mới',
        },
      ];

      prisma.support_tickets.findMany.mockResolvedValue(tickets);

      await expect(
        service.getUserTickets(10),
      ).resolves.toEqual(tickets);

      expect(prisma.support_tickets.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });
  });

  describe('getAdminTickets', () => {
    it('should return all tickets when no status filter is provided', async () => {
      const tickets = [
        {
          id: 1,
          status: 'open',
          user: {
            id: 10,
            full_name: 'User A',
            email: 'user-a@example.com',
          },
        },
      ];

      prisma.support_tickets.findMany.mockResolvedValue(tickets);

      await expect(
        service.getAdminTickets(),
      ).resolves.toEqual(tickets);

      expect(prisma.support_tickets.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('should filter admin tickets by status when status is provided', async () => {
      const tickets = [
        {
          id: 2,
          status: 'resolved',
          user: {
            id: 11,
            full_name: 'User B',
            email: 'user-b@example.com',
          },
        },
      ];

      prisma.support_tickets.findMany.mockResolvedValue(tickets);

      await expect(
        service.getAdminTickets('resolved'),
      ).resolves.toEqual(tickets);

      expect(prisma.support_tickets.findMany).toHaveBeenCalledWith({
        where: {
          status: 'resolved',
        },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });
  });

  describe('replyTicket', () => {
    it('should update the ticket and create a notification for the ticket owner', async () => {
      const ticket = {
        id: 25,
        user_id: 10,
        admin_reply: 'Chúng tôi đã tiếp nhận và xử lý yêu cầu của bạn.',
        status: 'resolved',
      };

      prisma.support_tickets.update.mockResolvedValue(ticket);
      notificationsService.createNotification.mockResolvedValue({
        id: 100,
      });

      await expect(
        service.replyTicket(
          25,
          'Chúng tôi đã tiếp nhận và xử lý yêu cầu của bạn.',
          'resolved',
        ),
      ).resolves.toEqual(ticket);

      expect(prisma.support_tickets.update).toHaveBeenCalledWith({
        where: {
          id: 25,
        },
        data: {
          admin_reply:
            'Chúng tôi đã tiếp nhận và xử lý yêu cầu của bạn.',
          status: 'resolved',
        },
      });

      expect(
        notificationsService.createNotification,
      ).toHaveBeenCalledWith({
        user_id: 10,
        type: 'system',
        title: 'Phản hồi khiếu nại/hỗ trợ',
        body: `Admin đã phản hồi ticket #25 của bạn: "Chúng tôi đã tiếp nhận và xử lý yêu cầu ..."`,
        target_url: '/support',
        entity_type: 'ticket',
        entity_id: 25,
      });
    });
  });
});