import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fastifyCookie, {
  CookieSerializeOptions,
  FastifyCookieOptions,
} from 'fastify-cookie'
import compression from 'fastify-compress'
import { contentParser } from 'fastify-multer'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { fastifyHelmet } from 'fastify-helmet'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './interceptors/response.interceptor'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'
import { join } from 'path'
import { version } from '../package.json'

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true, trustProxy: true })
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { bufferLogs: true },
  )
  const configService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  app.useGlobalInterceptors(new ResponseInterceptor())

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get<HttpAdapterHost>(HttpAdapterHost)),
  )

  const parseOptions: CookieSerializeOptions = {
    path: '/',
    //expires: new Date(),
    sameSite: 'none',
    httpOnly: true,
    maxAge: +configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    secure: true,
    signed: false,
  }

  await app.register(fastifyCookie, {
    secret: configService.get('COOKIES_SIGNATURE_SECRET'),
    parseOptions: parseOptions,
  } as FastifyCookieOptions)

  await app.register(compression, { encodings: ['gzip', 'deflate'] })

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [
          `'self'`,
          `'unsafe-inline'`,
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
        ],
        fontSrc: [`'self'`, 'fonts.gstatic.com'],
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
      },
    },
  })

  await app.register(contentParser)

  adapter.getInstance().addHook('onRequest', (request, reply, done) => {
    request['res'] = reply
    done()
  })

  app.useStaticAssets({
    root: join(__dirname, '../../'),
  })

  const config = new DocumentBuilder()
    .setTitle('FTF API')
    .setDescription('The FTF API description')
    .setVersion(version)
    .addServer(
      `/${configService.get('BASE_PATH', '')}`,
      process.env.NODE_ENV || 'Local Development',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-Token',
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  app.enableCors({
    origin: new RegExp(configService.get('CORS_REGEX')),
    credentials: true,
  })

  app.enableShutdownHooks()

  await app.listen(configService.get('PORT'), '0.0.0.0')
}

bootstrap()
