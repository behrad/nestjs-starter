import { Injectable, Logger } from '@nestjs/common'
import { UpdateDocumentDto } from './dto/update-document.dto'
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Error, Model } from 'mongoose'
import {
  DocumentTemplate,
  DocumentTemplateDocument,
} from './document-template.schema'
import { Documents, DocumentsDocument } from './document.schema'
import { InputValidationException } from '../filters/input-validation.exception'
import { DocumentTypeEnum } from './document-type.enum'
import { VehiclesService } from '../vehicles/vehicles.service'

@Injectable()
export class DocumentsService {
  private readonly logger: Logger = new Logger(DocumentsService.name)
  constructor(
    @InjectModel(DocumentTemplate.name)
    private templateModel: Model<DocumentTemplateDocument>,
    @InjectModel(Documents.name)
    private documentModel: Model<DocumentsDocument>,
    private vehicleService: VehiclesService,
  ) {}
  async create(userId: string, templateId: string, vehicleId: string, docs) {
    try {
      if (!docs) {
        throw new InputValidationException('No attachments provided')
      }
      const template = await this.templateModel.findById(templateId)
      let vehicle
      if (!template) {
        throw new InputValidationException('template Id not exists')
      }
      if (template.type === DocumentTypeEnum.Vehicle) {
        if (!vehicleId) {
          throw new InputValidationException('vehicle Id not provided')
        }
        vehicle = await this.vehicleService.getVehicle(vehicleId)
        if (!vehicle) {
          throw new InputValidationException('vehicle Id not exists')
        }
      }
      return new this.documentModel({
        userId,
        template,
        docs,
        vehicle,
      }).save()
    } catch (e) {
      this.logger.error(e)
      if (e instanceof Error.CastError) {
        throw new InputValidationException('invalid template Id')
      }
    }
  }

  findAll() {
    return `This action returns all documents`
  }

  findOne(id: number) {
    return `This action returns a #${id} document`
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`
  }

  remove(id: number) {
    return `This action removes a #${id} document`
  }

  createTemplate(createDocumentTemplateDto: CreateDocumentTemplateDto) {
    return new this.templateModel(createDocumentTemplateDto).save()
  }

  findTemplatesByType(type) {
    return this.templateModel.find({ type }).exec()
  }
}
