import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Platform } from '../decorators/user-agent.decorator'
import { ROLE } from '../auth/role.enum'
import { Exclude } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

@Schema({
  id: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    },
  },
})
export class User {
  id: string

  @ApiProperty()
  @Prop({ required: true, unique: true, index: true })
  email: string

  @Prop()
  phoneNumber: string

  @ApiProperty()
  @Prop()
  name: string

  @Prop()
  platform: Platform

  @Prop({ required: true })
  role: ROLE

  @Exclude()
  @Prop({ required: true })
  password?: string

  @Prop()
  currentHashedRefreshToken?: string

  @Prop()
  stripeCustomerId: string

  @Prop({ default: false })
  isEmailConfirmed: boolean

  @Prop({ default: false })
  isPhoneNumberConfirmed: boolean

  @Prop({ default: false })
  suspended: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)
export type UserDocument = User & Document
