import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common'
import { DocumentsService } from './documents.service'
import { CreateDocumentDto } from './dto/create-document.dto'
import { UpdateDocumentDto } from './dto/update-document.dto'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { editFileName, imageFileFilter } from './util/file-upload-util'
import { filesMapper } from './util/file-mapper'
import { ConfigService } from '@nestjs/config'
import { MultipleFilesInterceptor } from '../interceptors/files-upload.interecptor'
import { config } from 'dotenv'
import { CreateDocumentTemplateDto } from './dto/create-document-template.dto'
import { DocumentTypeEnum } from './document-type.enum'
import JwtAuthenticationGuard from '../auth/guards/jwt-authentication.guard'
import { User } from '../auth/decorators/user.decorator'
import { RoleGuard } from '../auth/guards/role.guard'
import { Roles } from '../auth/decorators/role.decorator'
import { ROLE } from '../auth/role.enum'

config()
const destination = `./${process.env.FILE_UPLOAD_PATH}`

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post(':templateId')
  @ApiParam({ name: 'templateId', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    MultipleFilesInterceptor('docs', 5, {
      storage: diskStorage({
        destination,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.DRIVER, ROLE.USER, ROLE.ADMIN)
  @ApiBearerAuth('JWT-Token')
  create(
    @Req() req,
    @User() user,
    @Param('templateId') templateId: string,
    @Body() body: CreateDocumentDto,
    @UploadedFiles() files,
  ) {
    const basePath = this.configService.get('BASE_PATH')
    return this.documentsService.create(
      user.id,
      templateId,
      body.vehicleId,
      filesMapper({ files, req, basePath }),
    )
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.ADMIN, ROLE.USER)
  @ApiBearerAuth('JWT-Token')
  findAll() {
    return this.documentsService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.DRIVER, ROLE.USER, ROLE.ADMIN)
  @ApiBearerAuth('JWT-Token')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.ADMIN, ROLE.USER, ROLE.DRIVER)
  @ApiBearerAuth('JWT-Token')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(+id, updateDocumentDto)
  }

  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('JWT-Token')
  @Roles(ROLE.USER, ROLE.DRIVER, ROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(+id)
  }

  @Post('/template')
  @ApiOperation({ summary: 'Create document template' })
  @ApiResponse({
    status: 200,
    description: 'Created document template with ID',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.ADMIN, ROLE.USER)
  @ApiBearerAuth('JWT-Token')
  createTemplate(@Body() createDocumentTemplateDto: CreateDocumentTemplateDto) {
    return this.documentsService.createTemplate(createDocumentTemplateDto)
  }

  @Get('/templates/:type')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('JWT-Token')
  @ApiOperation({ summary: 'Get list of document templates' })
  @ApiParam({
    name: 'type',
    enum: DocumentTypeEnum,
  })
  @ApiResponse({
    status: 200,
    description: 'List of document templates',
  })
  findTemplates(@Param('type') type: string) {
    return this.documentsService.findTemplatesByType(type)
  }
}
