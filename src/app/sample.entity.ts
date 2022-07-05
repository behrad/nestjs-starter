import { ApiProperty } from '@nestjs/swagger'

export class Sample {
  /**
   * The name of the Entity
   * @example NestIsGood
   */
  name: string

  @ApiProperty({ example: 2, description: 'The age of the project' })
  age: number

  @ApiProperty({
    example: 'GoodProject',
    description: 'The breed of the Project',
  })
  breed: string
}
