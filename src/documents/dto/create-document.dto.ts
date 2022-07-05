import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDocumentDto {
  @ApiProperty({ type: Array, format: 'binary', required: true })
  docs: string[]

  @ApiPropertyOptional()
  vehicleId: string
}
