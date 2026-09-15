import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: any;

  const createContext = (user?: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
    }) as any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    prisma = {
      users: {
        findUnique: jest.fn(),
      },
    };

    guard = new PermissionsGuard(reflector, prisma);
  });

  it('should allow access when endpoint has no required permissions', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createContext({
      id: 1,
      role: 'admin',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('should reject access when request has no authenticated user id', async () => {
    reflector.getAllAndOverride.mockReturnValue(['user.read']);

    const context = createContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Bạn không có quyền thực hiện hành động này!'),
    );

    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('should allow access when user has all required permissions', async () => {
    reflector.getAllAndOverride.mockReturnValue([
      'user.read',
      'user.role.update',
    ]);

    prisma.users.findUnique.mockResolvedValue({
      role_ref: {
        role_permissions: [
          {
            permission: {
              name: 'user.read',
            },
          },
          {
            permission: {
              name: 'user.role.update',
            },
          },
        ],
      },
    });

    const context = createContext({
      id: 1,
      role: 'admin',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        role_ref: {
          select: {
            role_permissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  it('should reject access when user is missing a required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue([
      'user.read',
      'user.role.update',
    ]);

    prisma.users.findUnique.mockResolvedValue({
      role_ref: {
        role_permissions: [
          {
            permission: {
              name: 'user.read',
            },
          },
        ],
      },
    });

    const context = createContext({
      id: 1,
      role: 'admin',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Bạn không có quyền thực hiện hành động này!'),
    );
  });

  it('should reject access when user has no role permissions', async () => {
    reflector.getAllAndOverride.mockReturnValue(['user.read']);

    prisma.users.findUnique.mockResolvedValue({
      role_ref: null,
    });

    const context = createContext({
      id: 999,
      role: 'admin',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Bạn không có quyền thực hiện hành động này!'),
    );
  });
});