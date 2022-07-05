import {
  Body,
  Controller,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common'
import SmsService from './sms.service'
import CheckVerificationCodeDto from '../auth/dto/checkVerificationCode.dto'
import JwtAuthenticationGuard from '../auth/guards/jwt-authentication.guard'
import RequestVerificationCodeDto from '../auth/dto/requestVerificationCode.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppAgent, AppAgentInfo } from '../decorators/user-agent.decorator'

@Controller('sms')
@UseInterceptors(ClassSerializerInterceptor)
export default class SmsController {
  constructor(private readonly smsService: SmsService) {}
}
