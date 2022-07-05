import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Twilio } from 'twilio'
import { Redis } from 'ioredis'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Chance } from 'chance'
import { AppAgentInfo } from '../decorators/user-agent.decorator'
import { InputValidationException } from '../filters/input-validation.exception'
import { ROLE } from '../auth/role.enum'
import { PhoneNumberInstance } from 'twilio/lib/rest/lookups/v1/phoneNumber'

@Injectable()
export default class SmsService {
  private twilioClient: Twilio
  private chance
  private readonly logger = new Logger(SmsService.name)

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.chance = new Chance()

    const accountSid = configService.get('TWILIO_ACCOUNT_SID')
    const apiKey = configService.get('TWILIO_API_KEY')
    const apiSecret = configService.get('TWILIO_API_SECRET')
    this.twilioClient = new Twilio(apiKey, apiSecret, {
      accountSid,
    })
  }

  async initiatePhoneNumberVerification(
    phoneNumberWithCountryCode: string,
    role?: ROLE,
  ) {
    if (role) {
      await this.validatePhoneNumber(phoneNumberWithCountryCode, role)
    }

    const code = this.generateCode()
    const message = this.toVerificationSmsText(code)
    const { set } = await this.checkSetCodeForPhoneNumber(
      code,
      phoneNumberWithCountryCode,
    )
    if (!set) {
      return {
        message: 'already initiated',
      }
    }
    await this.sendMessage(phoneNumberWithCountryCode, message)
    return {}
  }

  async confirmPhoneNumber(
    phoneNumberWithCountryCode: string,
    verificationCode: string,
    userAgent: AppAgentInfo,
  ) {
    const { match } = await this.verifyCodeForPhoneNumber(
      verificationCode,
      phoneNumberWithCountryCode,
    )
    if (!match) {
      throw new InputValidationException(
        'The entered code is invalid. Please try again',
      )
    }
    return match
  }

  generateCode() {
    return this.chance.integer({ min: 100000, max: 999999 })
  }

  toVerificationSmsText(code) {
    return `Your FTF verification code is ${code}`
  }

  toPhoneNumberWithCountryCode({ countryCode, phoneNumber }) {
    const countryCodeWithPlus = countryCode.replace(/^(\d)/, '+$1')
    return `${countryCodeWithPlus}${phoneNumber}`
  }

  async checkSetCodeForPhoneNumber(code, phoneNumber) {
    const expiryInSeconds: number = this.configService.get<number>(
      'SMS_VERIFICATION_CODE_EXPIRATION_TIME',
    )
    const reply = await this.redis.setnx(`verification:${phoneNumber}`, code)
    if (reply === 0) {
      return {
        set: false,
      }
    }
    this.logger.debug(`Bound verification code ${code} for ${phoneNumber}`)
    await this.redis.expire(`verification:${phoneNumber}`, expiryInSeconds)
    return {
      set: true,
    }
  }

  async verifyCodeForPhoneNumber(code, phoneNumber) {
    const initiatedCode = await this.redis.get(`verification:${phoneNumber}`)
    if (initiatedCode === code) {
      // noinspection ES6MissingAwait
      this.redis.del(`verification:${phoneNumber}`)
      return {
        match: true,
      }
    }
    return {
      match: false,
    }
  }

  async sendMessage(receiverPhoneNumber: string, message: string) {
    const senderPhoneNumber = this.configService.get(
      'TWILIO_SENDER_PHONE_NUMBER',
    )
    try {
      return this.twilioClient.messages.create({
        body: message,
        from: senderPhoneNumber,
        to: receiverPhoneNumber,
      })
    } catch (e) {
      this.logger.error(e)
    }
  }

  async validatePhoneNumber(phoneNumberWithCountryCode: string, role: ROLE) {
    let response: PhoneNumberInstance
    try {
      response = await this.twilioClient.lookups.v1
        .phoneNumbers(phoneNumberWithCountryCode)
        .fetch({ type: ['carrier'] })
    } catch (e) {
      this.logger.error(e)
      if (e.status == 404) {
        throw new InputValidationException('The phone number is incorrect.')
      }
    }
    this.logger.debug('twilio response', response)
    const result = this.validateTwilioResponse(response)
    this.logger.debug('twilio validation result', result)
    if (result.error) {
      throw new InputValidationException(result.error)
    }

    if (role == ROLE.DRIVER && !result.countryCode.includes('GB')) {
      throw new InputValidationException(
        `Sorry, We are unable to serve you at ${result.countryCode}`,
      )
    }
  }

  private validateTwilioResponse(response: PhoneNumberInstance) {
    const carrier = response.carrier
    if (carrier && response.carrier.error_code) {
      return { error: 'The phone number is incorrect.' }
    }

    if (carrier && response.carrier.type != 'mobile') {
      return { error: 'The phone number must be mobile number.' }
    }

    return {
      phoneNumber: response.phoneNumber,
      countryCode: response.countryCode,
      type: response.carrier?.type,
    }
  }
}
