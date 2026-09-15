import { SavedPostsService } from './saved-posts.service';

describe('SavedPostsService', () => {
  let service: SavedPostsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      saved_posts: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    service = new SavedPostsService(prisma);
  });

  describe('toggleSave', () => {
    it('should create a saved post when the room is not already saved', async () => {
      prisma.saved_posts.findUnique.mockResolvedValue(null);
      prisma.saved_posts.create.mockResolvedValue({
        id: 1,
        user_id: 10,
        room_id: 25,
      });

      await expect(
        service.toggleSave(10, 25),
      ).resolves.toEqual({ saved: true });

      expect(prisma.saved_posts.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_room_id: {
            user_id: 10,
            room_id: 25,
          },
        },
      });

      expect(prisma.saved_posts.create).toHaveBeenCalledWith({
        data: {
          user_id: 10,
          room_id: 25,
        },
      });

      expect(prisma.saved_posts.delete).not.toHaveBeenCalled();
    });

    it('should delete the saved post when the room is already saved', async () => {
      prisma.saved_posts.findUnique.mockResolvedValue({
        id: 99,
        user_id: 10,
        room_id: 25,
      });

      prisma.saved_posts.delete.mockResolvedValue({
        id: 99,
      });

      await expect(
        service.toggleSave(10, 25),
      ).resolves.toEqual({ saved: false });

      expect(prisma.saved_posts.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_room_id: {
            user_id: 10,
            room_id: 25,
          },
        },
      });

      expect(prisma.saved_posts.delete).toHaveBeenCalledWith({
        where: {
          id: 99,
        },
      });

      expect(prisma.saved_posts.create).not.toHaveBeenCalled();
    });
  });

  describe('checkSaved', () => {
    it('should return true when the room is saved by the user', async () => {
      prisma.saved_posts.findUnique.mockResolvedValue({
        id: 99,
        user_id: 10,
        room_id: 25,
      });

      await expect(
        service.checkSaved(10, 25),
      ).resolves.toBe(true);

      expect(prisma.saved_posts.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_room_id: {
            user_id: 10,
            room_id: 25,
          },
        },
      });
    });
  });

  describe('getUserSavedPosts', () => {
    it('should return the user saved posts with room data ordered by newest first', async () => {
      const savedPosts = [
        {
          id: 2,
          user_id: 10,
          room_id: 30,
          room: {
            id: 30,
            title: 'Phòng trọ A',
          },
        },
      ];

      prisma.saved_posts.findMany.mockResolvedValue(savedPosts);

      await expect(
        service.getUserSavedPosts(10),
      ).resolves.toEqual(savedPosts);

      expect(prisma.saved_posts.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 10,
        },
        include: {
          room: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });
  });
});