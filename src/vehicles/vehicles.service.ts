import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from '../users/user.schema'
import { InputValidationException } from '../filters/input-validation.exception'
import { UpdateVehicleDto, CreateVehicleDto } from './dto/vehicle.dto'
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema'

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private readonly model: Model<VehicleDocument>,
  ) {}

  // fetch all vehicles
  async getAllVehicles(): Promise<VehicleDocument[]> {
    const vehicles = await this.model.find().exec()
    return vehicles
  }

  // fetch all vehicles
  async getAllVehiclesForUser(id: string): Promise<VehicleDocument[]> {
    const vehicles = await this.model.find({ userId: id }).exec()
    return vehicles
  }

  // get a single vehicle by looking up in id
  async getVehicle(vehicleId: string): Promise<VehicleDocument> {
    return this.findVehicle(vehicleId)
  }

  // Add a vehicle
  async addVehicle(
    user: User,
    vehicleDTO: CreateVehicleDto,
  ): Promise<VehicleDocument> {
    const newVehicle = await new this.model({
      ...vehicleDTO,
      createAt: new Date(),
      userId: user.id,
    })
    return newVehicle.save()
  }

  // Edit vehicle detail
  async updateVehicle(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleDocument> {
    const vehicle = await this.findVehicle(id)
    const updatedVehicle = await vehicle.update(
      { ...updateVehicleDto, updateAt: new Date() },
      { new: true },
    )
    return updatedVehicle
  }

  // Delete a vehicle
  async deleteVehicle(id: string): Promise<VehicleDocument> {
    const vehicle = await this.findVehicle(id)
    return await vehicle.delete()
  }

  private async findVehicle(id: string): Promise<VehicleDocument> {
    const vehicle = await this.model.findById(id).exec()
    if (!vehicle) {
      // fixme: we need return the ok status with custom error message.
      throw new InputValidationException(`No Vehicle Found!`)
    }
    return vehicle
  }
}
