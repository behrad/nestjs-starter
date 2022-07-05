import { PartialType } from '@nestjs/swagger'
import { VehicleDto } from './base-vehicle.dto'

export class CreateVehicleDto extends VehicleDto {}
export class UpdateVehicleDto extends PartialType(VehicleDto) {}
