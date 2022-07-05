import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common'

import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { VehiclesService } from './vehicles.service'
import { UpdateVehicleDto, CreateVehicleDto } from './dto/vehicle.dto'
import { Roles } from '../auth/decorators/role.decorator'
import { ROLE } from '../auth/role.enum'
import { Vehicle } from './schemas/vehicle.schema'
import { Authorize } from '../decorators/authorize.decorator'
import { User } from '../auth/decorators/user.decorator'

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @ApiOperation({
    summary: 'Return Vehciles for current user. this is temporary',
  })
  @Get()
  @Authorize(ROLE.ADMIN, ROLE.DRIVER)
  async getAllVehiclesForCurrentUser(@User() user) {
    return await this.vehiclesService.getAllVehiclesForUser(user.id)
  }

  @ApiOperation({ summary: 'Return All Vehciles.' })
  @Get('/all')
  @Authorize(ROLE.ADMIN)
  async getAllVehicles() {
    return await this.vehiclesService.getAllVehicles()
  }

  @ApiOperation({ summary: 'Create a Vehicle' })
  @ApiCreatedResponse({
    type: Vehicle,
    description: 'Creates new Vehicle Object.',
  })
  @Authorize(ROLE.ADMIN, ROLE.DRIVER)
  @Post()
  async addVehicle(@User() user, @Body() createVehicleDto: CreateVehicleDto) {
    return await this.vehiclesService.addVehicle(user, createVehicleDto)
  }

  @ApiOperation({ summary: 'Return a vehicle by given an specific vehicle Id' })
  @Authorize(ROLE.ADMIN, ROLE.DRIVER, ROLE.PASSENGER)
  @Get(':id')
  async getVehicle(@Param('id') id: string) {
    return await this.vehiclesService.getVehicle(id)
  }

  @ApiOperation({
    summary: 'Update a vehicle information for a given vehicle Id',
  })
  @Patch(':id')
  @Authorize(ROLE.ADMIN)
  async updateVehicle(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.vehiclesService.updateVehicle(id, updateVehicleDto)
  }

  @ApiOperation({
    summary: 'Update a vehicle information for a given vehicle Id',
  })
  @Authorize(ROLE.ADMIN)
  @Put(':id')
  async updateVehicleDetail(
    @Param('id') id: string,
    @Body() updateVehicleDto: CreateVehicleDto,
  ) {
    return await this.vehiclesService.updateVehicle(id, updateVehicleDto)
  }

  @ApiOperation({ summary: 'Delete a vehicle by a given id' })
  @Roles(ROLE.ADMIN)
  @Delete(':id')
  async removeVehicle(@Param('id') id: string) {
    return await this.vehiclesService.deleteVehicle(id)
  }
}
