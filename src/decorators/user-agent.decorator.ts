import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common'
import { ROLE } from '../auth/role.enum'
import { InputValidationException } from '../filters/input-validation.exception'

export interface AppAgentInfo {
  platform: Platform
  role: ROLE.DRIVER | ROLE.PASSENGER | ROLE.USER
}

const AgentRoles = {
  Driver: ROLE.DRIVER,
  Rider: ROLE.PASSENGER,
}

export enum Platform {
  Android = 'Android',
  iOS = 'iOS',
  Web = 'Web',
}

enum AgentIndex {
  Role = 1,
  Platform = 2,
}

export const AppAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AppAgentInfo => {
    const request = ctx.switchToHttp().getRequest()
    const header = request.headers['app-agent']
    if (!header) {
      throw new BadRequestException('No App-Agent header provided')
    }
    const matched = header.match(/(.+)\/.*;.*;\s*(\w+)/)
    if (matched && matched[1]) {
      if (matched[AgentIndex.Role] === 'Control-Panel') {
        return {
          platform: Platform.Web,
          role: ROLE.USER,
        }
      }
      if (
        Platform[matched[AgentIndex.Platform]] &&
        AgentRoles[matched[AgentIndex.Role]]
      ) {
        return {
          platform: Platform[matched[AgentIndex.Platform]],
          role: AgentRoles[matched[AgentIndex.Role]],
        }
      }
    }
    throw new InputValidationException('Invalid App-Agent header')
  },
)
