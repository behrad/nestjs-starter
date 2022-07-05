import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CheckVerificationCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string
}

export default CheckVerificationCodeDto
