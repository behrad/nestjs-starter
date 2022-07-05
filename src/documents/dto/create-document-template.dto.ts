import { PickType } from '@nestjs/swagger'
import { DocumentTemplate } from '../document-template.schema'

export class CreateDocumentTemplateDto extends PickType(DocumentTemplate, [
  'title',
  'description',
  'shortDescription',
  'totalDocs',
  'type',
] as const) {}
