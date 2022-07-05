import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LogInDto {
  @ApiProperty({ description: 'Username' })
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Plain Text Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string
}

export default LogInDto
