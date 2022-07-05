import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { DocumentTypeEnum } from './document-type.enum'
import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

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
export class DocumentTemplate {
  id: string

  @ApiProperty()
  @Prop({ required: true })
  title: string

  @ApiProperty()
  @Prop()
  description: string

  @ApiProperty()
  @Prop()
  shortDescription: string

  @ApiProperty()
  @Prop({ required: true, min: 1, max: 5, default: 1 })
  totalDocs: number

  @ApiProperty({ enum: DocumentTypeEnum, example: 'driver|vehicle' })
  @IsIn([DocumentTypeEnum.Driver, DocumentTypeEnum.Vehicle])
  @Prop({ required: true })
  type: DocumentTypeEnum
}

export const DocumentTemplateSchema =
  SchemaFactory.createForClass(DocumentTemplate)
export type DocumentTemplateDocument = DocumentTemplate & Document
