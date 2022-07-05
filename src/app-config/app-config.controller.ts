import { Controller, Get } from '@nestjs/common'
import { AppConfigService } from './app-config.service'
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppAgent } from '../decorators/user-agent.decorator'

@ApiTags('Config')
@Controller('config')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @ApiOperation({ summary: 'Get the application config' })
  @ApiHeader({ name: 'App-Agent' })
  @Get('/')
  async getConfig(@AppAgent() agent) {
    return await this.appConfigService.get(agent.role)
  }
}
