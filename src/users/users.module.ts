import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import UsersController from './users.controller'
import { UsersService } from './users.service'
import { User, UserSchema } from './user.schema'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
    ConfigModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
