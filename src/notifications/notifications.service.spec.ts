import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;
  let notificationsGateway: any;

  beforeEach(() => {
    prisma = {
      notifications: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    notificationsGateway = {
      emitNewNotification: jest.fn(),
      emitUnreadCount: jest.fn(),
    };

    service = new NotificationsService(
      prisma,
      notificationsGateway,
    );
  });

  describe('createNotification', () => {
    it('should create notification, emit realtime events, and return the notification', async () => {
      const input = {
        user_id: 10,
        type: 'system',
        title: 'Thông báo mới',
        body: 'Bạn có một thông báo mới',
        target_url: '/support',
        entity_type: 'ticket',
        entity_id: 25,
      };

      const notification = {
        id: 100,
        ...input,
        is_read: false,
      };

      prisma.notifications.create.mockResolvedValue(notification);
      prisma.notifications.count.mockResolvedValue(3);

      await expect(
        service.createNotification(input),
      ).resolves.toEqual(notification);

      expect(prisma.notifications.create).toHaveBeenCalledWith({
        data: {
          user_id: 10,
          type: 'system',
          title: 'Thông báo mới',
          body: 'Bạn có một thông báo mới',
          target_url: '/support',
          entity_type: 'ticket',
          entity_id: 25,
        },
      });

      expect(prisma.notifications.count).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          is_read: false,
        },
      });

      expect(
        notificationsGateway.emitNewNotification,
      ).toHaveBeenCalledWith(10, notification);

      expect(
        notificationsGateway.emitUnreadCount,
      ).toHaveBeenCalledWith(10, 3);
    });
  });

  describe('getNotifications', () => {
    it('should return the latest 50 notifications for the user', async () => {
      const notifications = [
        {
          id: 1,
          user_id: 10,
          title: 'Thông báo mới',
        },
      ];

      prisma.notifications.findMany.mockResolvedValue(
        notifications,
      );

      await expect(
        service.getNotifications(10),
      ).resolves.toEqual(notifications);

      expect(prisma.notifications.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 50,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread notifications for the specified user', async () => {
      prisma.notifications.count.mockResolvedValue(4);

      await expect(
        service.getUnreadCount(10),
      ).resolves.toBe(4);

      expect(prisma.notifications.count).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          is_read: false,
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark the notification as read and emit the updated unread count', async () => {
      prisma.notifications.updateMany.mockResolvedValue({
        count: 1,
      });

      prisma.notifications.count.mockResolvedValue(2);

      await expect(
        service.markAsRead(10, 100),
      ).resolves.toEqual({ success: true });

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          id: 100,
          user_id: 10,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

      expect(prisma.notifications.count).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          is_read: false,
        },
      });

      expect(
        notificationsGateway.emitUnreadCount,
      ).toHaveBeenCalledWith(10, 2);
    });

    it('should not emit unread count when no notification was updated', async () => {
      prisma.notifications.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.markAsRead(10, 100),
      ).resolves.toEqual({ success: true });

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          id: 100,
          user_id: 10,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

      expect(prisma.notifications.count).not.toHaveBeenCalled();
      expect(
        notificationsGateway.emitUnreadCount,
      ).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read and emit zero unread count', async () => {
      prisma.notifications.updateMany.mockResolvedValue({
        count: 5,
      });

      await expect(
        service.markAllAsRead(10),
      ).resolves.toEqual({ success: true });

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

      expect(
        notificationsGateway.emitUnreadCount,
      ).toHaveBeenCalledWith(10, 0);
    });
  });
});