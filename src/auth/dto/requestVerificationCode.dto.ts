import {
  IsNotEmpty,
  IsNumberString,
  IsMobilePhone,
  MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

const PHONE_NUMBER_MIN_LEN = 10
export class RequestVerificationCodeDto {
  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  @MinLength(PHONE_NUMBER_MIN_LEN, {
    message: 'The phone number is incorrect.',
  })
  phoneNumber: string

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  countryCode: string
}

export default RequestVerificationCodeDto
