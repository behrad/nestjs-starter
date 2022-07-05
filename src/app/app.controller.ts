import {
  Body,
  Controller,
  Get,
  Logger,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { RateLimit } from 'nestjs-rate-limiter'
import { AppService } from './app.service'
import fastify = require('fastify')
import { AppAgent, AppAgentInfo } from '../decorators/user-agent.decorator'

@ApiTags('Server')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Health' })
  @ApiResponse({
    status: 200,
    description: 'Server health information',
  })
  @RateLimit({
    keyPrefix: 'hello',
    points: 3,
    duration: 5,
    blackList: [''],
    errorMessage: 'This API cannot be run more than 3 times in 5 seconds',
  })
  getHello(@Req() req: fastify.FastifyRequest, @Query() query): object {
    const { ip } = req
    this.logger.debug({ query }, { ip })
    return {
      ip,
      ...this.appService.getHello(),
    }
  }
}
