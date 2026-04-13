import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role?.name) throw new ForbiddenException('No role assigned');

    const hasRole =
      requiredRoles.includes(user.role.name) ||
      requiredRoles.some(
        (role) => user.role.hierarchy_level >= this.getMinHierarchy(role),
      );

    if (!hasRole) throw new ForbiddenException('Insufficient permissions');
    return true;
  }

  private getMinHierarchy(roleName: string): number {
    // You can map role names to min hierarchy if needed
    return 0;
  }
}
