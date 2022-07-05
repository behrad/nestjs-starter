import { Module } from '@nestjs/common'
import { AppConfigService } from './app-config.service'
import { AppConfigController } from './app-config.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Config, ConfigSchema } from './config.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
  ],
  providers: [AppConfigService],
  controllers: [AppConfigController],
  exports: [AppConfigService],
})
export class AppConfigModule {}
