import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger'
import { DocumentStatus } from './document-status.enum'
import { DocumentTemplate } from './document-template.schema'
import { Type } from 'class-transformer'
import * as mongoose from 'mongoose'
import { Vehicle } from '../vehicles/schemas/vehicle.schema'

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
export class Documents {
  id: string

  @Prop({ required: true })
  userId: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DocumentTemplate.name,
    required: true,
  })
  @Type(() => DocumentTemplate)
  template: DocumentTemplate

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Vehicle.name,
    required: false,
  })
  @Type(() => Vehicle)
  vehicle: Vehicle

  @ApiProperty({ enum: DocumentStatus })
  @Prop({ required: true, default: DocumentStatus.Pending })
  status: DocumentStatus

  @ApiProperty()
  @Prop()
  reason: string

  @ApiProperty()
  @Prop()
  expirationDate: Date

  @ApiResponseProperty()
  @Prop({ required: true })
  docs: [
    {
      url: string
      mimetype: string
    },
  ]
}

export const DocumentsSchema = SchemaFactory.createForClass(Documents)
export type DocumentsDocument = Documents & Document
