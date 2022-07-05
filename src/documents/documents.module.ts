import { Module } from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { DocumentsController } from './documents.controller'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import {
  DocumentTemplate,
  DocumentTemplateSchema,
} from './document-template.schema'
import { Documents, DocumentsSchema } from './document.schema'
import { VehiclesService } from '../vehicles/vehicles.service'
import { VehiclesModule } from '../vehicles/vehicles.module'

@Module({
  imports: [
    ConfigModule,
    VehiclesModule,
    MongooseModule.forFeature([
      { name: DocumentTemplate.name, schema: DocumentTemplateSchema },
    ]),
    MongooseModule.forFeature([
      { name: Documents.name, schema: DocumentsSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
