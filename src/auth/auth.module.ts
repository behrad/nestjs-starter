import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy'
import { UsersModule } from '../users/users.module'
import { SmsModule } from '../sms/sms.module'
import SmsService from '../sms/sms.service'

@Module({
  imports: [
    UsersModule,
    SmsModule,
    PassportModule,
    ConfigModule,
    JwtModule.register({}),
    // EmailConfirmationModule,
  ],
  providers: [
    AuthService,
    SmsService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
