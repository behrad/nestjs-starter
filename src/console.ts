// import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import * as repl from 'repl'
import * as Logger from 'purdy'
import { UsersService } from './users/users.service'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth/auth.service'
import { AppService } from './app/app.service'
import { AppConfigService } from './app-config/app-config.service'
import SmsService from './sms/sms.service'
import EmailService from './email/email.service'
import targetModule = require('./app.module')

const LOGGER_OPTIONS = {
  indent: 2,
  depth: 1,
}

class InteractiveNestJS {
  async run() {
    const app = await NestFactory.createApplicationContext(
      // tslint:disable-next-line: no-string-literal
      targetModule['AppModule'],
    )
    const server = repl.start({
      useColors: true,
      prompt: '> ',
      writer: replWriter,
      ignoreUndefined: true,
    })
    server.context.app = app
    server.context.users = app.get(UsersService)
    server.context.config = app.get(ConfigService)
    server.context.auth = app.get(AuthService)
    server.context.server = app.get(AppService)
    server.context.appConfig = app.get(AppConfigService)
    server.context.sms = app.get(SmsService)
    server.context.email = app.get(EmailService)
  }
}

function replWriter(value: object): string {
  return Logger.stringify(value, LOGGER_OPTIONS)
}

const session = new InteractiveNestJS()
session.run()
