import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Document } from 'mongoose'
import { Transform } from 'class-transformer'

export type VehicleDocument = Vehicle & Document

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
export class Vehicle {
  @ApiProperty()
  @Prop()
  id: string

  //TODO: we need to think about relational between objects.
  @Prop({ required: true })
  userId: string

  @ApiProperty()
  @Prop({ required: true })
  make: string

  @ApiProperty()
  @Prop({ required: true })
  model: string

  @ApiProperty()
  @Prop({ required: true })
  plateNumber: string

  @ApiProperty()
  @Prop({ required: true, min: 2015 })
  manufactureYear: number

  @ApiProperty()
  @Prop({ required: true, uppercase: true })
  color: string

  @ApiProperty()
  @Prop({ required: true, default: false })
  active: boolean

  @ApiProperty()
  @Prop({ request: true, default: false })
  verified: boolean

  @ApiProperty()
  @Transform((value) => value.valueOf(), { toPlainOnly: true })
  @Prop({ default: Date.now, required: true })
  createAt: Date

  @ApiPropertyOptional()
  @Transform((value) => value.valueOf().toLocaleString(), { toPlainOnly: true })
  @Prop()
  updateAt?: Date
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle)
