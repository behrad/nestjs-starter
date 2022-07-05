import { ApiProperty } from '@nestjs/swagger'

export class SingleDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  document: string
}

export class MultipleDocumentDto {
  @ApiProperty({ type: Array, format: 'binary' })
  documents: string[]
}
