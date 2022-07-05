import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { ROLES_KEY } from '../auth/decorators/role.decorator'
import JwtAuthenticationGuard from '../auth/guards/jwt-authentication.guard'
import { RoleGuard } from '../auth/guards/role.guard'
import { ROLE } from '../auth/role.enum'

export function Authorize(...roles: ROLE[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthenticationGuard, RoleGuard),
    ApiBearerAuth('JWT-Token'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
}
