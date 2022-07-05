import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app/app.controller'
import { AppService } from './app/app.service'
import * as Joi from '@hapi/joi'
import { RateLimiterGuard, RateLimiterModule } from 'nestjs-rate-limiter'
import { APP_GUARD } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { AppConfigModule } from './app-config/app-config.module'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { SmsModule } from './sms/sms.module'
import { EmailModule } from './email/email.module'
import { name } from '../package.json'
import { DocumentsModule } from './documents/documents.module'
import { VehiclesModule } from './vehicles/vehicles.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number(),
        FRONTEND_URL: Joi.string(),
        CORS_REGEX: Joi.string().required(),
        FILE_UPLOAD_PATH: Joi.string(),

        ADMIN_EMAIL: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),
        ADMIN_PHONE: Joi.string().required(),

        // POSTGRES_HOST: Joi.string().required(),
        // POSTGRES_PORT: Joi.number().required(),
        // POSTGRES_USER: Joi.string().required(),
        // POSTGRES_PASSWORD: Joi.string().required(),
        // POSTGRES_DB: Joi.string().required(),

        MONGO_USERNAME: Joi.string().required(),
        MONGO_PASSWORD: Joi.string().required(),
        MONGO_DATABASE: Joi.string().required(),
        MONGO_HOST: Joi.string().required(),

        COOKIES_SIGNATURE_SECRET: Joi.string(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        SMS_VERIFICATION_CODE_EXPIRATION_TIME: Joi.number().required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),

        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),

        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_API_KEY: Joi.string().required(),
        TWILIO_API_SECRET: Joi.string().required(),
        TWILIO_SENDER_PHONE_NUMBER: Joi.string().required(),

        // STRIPE_SECRET_KEY: Joi.string(),
        // STRIPE_CURRENCY: Joi.string(),
        // STRIPE_WEBHOOK_SECRET: Joi.string(),
      }),
    }),

    RateLimiterModule.register({
      for: 'Fastify',
      type: 'Memory', // Redis
      keyPrefix: name,
      points: 4,
      pointsConsumed: 1,
      inmemoryBlockOnConsumed: 0,
      duration: 1,
      blockDuration: 0,
      inmemoryBlockDuration: 0,
      queueEnabled: false,
      whiteList: [],
      blackList: [],
      storeClient: undefined,
      insuranceLimiter: undefined,
      storeType: undefined,
      dbName: undefined,
      tableName: undefined,
      tableCreated: undefined,
      clearExpiredByTimeout: undefined,
      execEvenly: false,
      execEvenlyMinDelayMs: undefined,
      indexKeyPrefix: {},
      maxQueueSize: 100,
      omitResponseHeaders: false,
      errorMessage: 'Rate limit exceeded',
      logger: true,
      customResponseSchema: undefined,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME')
        const password = configService.get('MONGO_PASSWORD')
        const database = configService.get('MONGO_DATABASE')
        const host = configService.get('MONGO_HOST')

        return {
          uri: `mongodb://${username}:${password}@${host}`,
          dbName: database,
        }
      },
      inject: [ConfigService],
    }),

    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        closeClient: true,
        config: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),

    AuthModule,

    ConfigModule,

    AppConfigModule,

    SmsModule,

    EmailModule,

    DocumentsModule,

    VehiclesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    ConfigService,
  ],
})
export class AppModule {}
