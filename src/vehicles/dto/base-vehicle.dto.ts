import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Min,
  MinLength,
} from 'class-validator'

const PLATE_NUBMER_MIN = 5
const PLATE_NUMBER_MAX = 7
const MIN_MANUFACTURE_YEAR = 2015
export class VehicleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  make: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  model: string

  @IsNotEmpty()
  @IsString()
  @Length(PLATE_NUBMER_MIN, PLATE_NUMBER_MAX, {
    groups: [`plate`],
    message: `The plate number should be between ${PLATE_NUBMER_MIN} and ${PLATE_NUMBER_MAX} characters.`,
  })
  @ApiProperty()
  plateNumber: string

  @IsNotEmpty()
  @Min(MIN_MANUFACTURE_YEAR, {
    message: `The Vehicle manufacture year should be from ${MIN_MANUFACTURE_YEAR}`,
  })
  @ApiProperty()
  @IsInt()
  manufactureYear: number

  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  @IsString()
  color: string
}
