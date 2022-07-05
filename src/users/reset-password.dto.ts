import { PickType } from '@nestjs/swagger'
import { User } from './user.schema'

export class ResetPasswordDto extends PickType(User, ['email'] as const) {}
