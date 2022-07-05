import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common'
import prettyPrint from 'pretty-print-ms'
import { version } from '../../package.json'

@Injectable()
export class AppService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name)

  start: number
  // version: string

  async onModuleInit(): Promise<void> {
    this.start = Date.now()
    // if the project run by `npm run start:*` the npm package info would be placed in env variables.
    // this.version = process.env.npm_package_version
    return Promise.resolve()
  }

  getHello(): object {
    return {
      env: process.env.NODE_ENV,
      uptime: prettyPrint(Date.now() - this.start),
      version: version,
    }
  }

  onApplicationShutdown(signal: string) {
    this.logger.log(signal)
  }
}
