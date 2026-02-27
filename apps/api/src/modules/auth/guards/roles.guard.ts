// apps/api/src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    // super_admin bypasses ALL role checks — full platform access
    if (user.role === UserRole.SUPER_ADMIN) return true;

    // Role hierarchy: owner > admin > manager > viewer
    const roleHierarchy: Record<string, number> = {
      [UserRole.OWNER]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.MANAGER]: 2,
      [UserRole.VIEWER]: 1,
    };

    const userLevel = roleHierarchy[user.role as UserRole] ?? 0;
    return requiredRoles.some(
      (role) => userLevel >= (roleHierarchy[role] ?? 0),
    );
  }
}
