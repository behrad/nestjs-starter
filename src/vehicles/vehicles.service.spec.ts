import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Vehicle } from './schemas/vehicle.schema'
import { VehiclesService } from './vehicles.service'

describe('VehiclesService', () => {
  let service: VehiclesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<VehiclesService>(VehiclesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
