import { PickType } from '@nestjs/swagger'
import { User } from './user.schema'

export class UserUpdateDto extends PickType(User, ['name', 'email'] as const) {}
