import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLE } from '../role.enum'
import { ROLES_KEY } from '../decorators/role.decorator'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }
    const { user } = context.switchToHttp().getRequest()

    if (requiredRoles.some((role) => user.role?.includes(role))) {
      return true
    }

    throw new UnauthorizedException(
      `User with roles ${user.role} does not have access to this route with roles ${requiredRoles}`,
    )
  }
}
