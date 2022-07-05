import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Vehicle } from './schemas/vehicle.schema'
import { VehiclesController } from './vehicles.controller'
import { VehiclesService } from './vehicles.service'

describe('VehiclesController', () => {
  let controller: VehiclesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        VehiclesService,
        {
          provide: getModelToken(Vehicle.name),
          useValue: {
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<VehiclesController>(VehiclesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
