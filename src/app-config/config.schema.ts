import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'

@Schema()
export class Config {
  @Prop()
  id: string

  @Prop({ type: SchemaTypes.Mixed })
  data: {
    driver: object
    passenger: object
  }
}

export const ConfigSchema = SchemaFactory.createForClass(Config)
export type ConfigDocument = Config & Document
