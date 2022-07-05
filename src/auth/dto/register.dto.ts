import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
  IsIn,
  IsOptional,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/)
  phoneNumber: string

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'user', 'driver', 'passenger'])
  role: string
}

export default RegisterDto
