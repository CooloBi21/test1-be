import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

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

    guard = new RolesGuard(reflector);
  });

  it('should allow access when endpoint has no required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createContext({
      id: 1,
      role: 'renter',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createContext({
      id: 1,
      role: 'admin',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject access when user does not have a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createContext({
      id: 1,
      role: 'renter',
    });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Bạn không có quyền thực hiện hành động này!'),
    );
  });

  it('should reject access when request has no authenticated user', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    const context = createContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Bạn không có quyền thực hiện hành động này!'),
    );
  });
});