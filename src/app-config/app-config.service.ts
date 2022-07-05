import { Logger, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Config, ConfigDocument } from './config.schema'

@Injectable()
export class AppConfigService implements OnModuleInit {
  private readonly logger = new Logger(AppConfigService.name)

  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const configExists = await this.count()
    if (!configExists) {
      this.logger.log('Creating app config')
      await this.create()
    }
  }

  async get(key: string) {
    return ((await this.configModel.findOne()) || {}).data?.[key]
  }

  async count(): Promise<number> {
    return this.configModel.count()
  }

  async create() {
    await this.configModel.create({
      data: {
        driver: {
          otpvalid: 0,
          locationIntercal: 1,
          stripeKey: '',
          googleApiKey: '',
          mapBoxKey: '',
          appUpdate: {
            version: 0,
            app: '',
            mandatory: false,
          },
          menuItems: [
            {
              id: 'home',
              title: 'Home',
              icon: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
              type: 'item',
            },
          ],
          onboarding: {
            title: 'FTF',
            description: 'I dont know',
            image: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
          },
          thanks: {
            title: 'well done',
            description: 'I dont know',
            image: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
            animatedImage: 'url.com',
          },
          about: {
            brandName: '',
            description: 'I dont know',
            socialMedias: [
              {
                id: 'facebook',
                name: 'Facebook',
                icon: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
                '': 'https://www.facebook.com/freethefleet',
              },
              {
                id: 'twitter',
                name: 'Twitter',
                icon: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
                '': 'https://twitter.com/freethefleet',
              },
              {
                id: 'instagram',
                name: 'Instagram',
                icon: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
                '': 'https://www.instagram.com/freethefleet',
              },
            ],
          },
          support: {
            url: '',
            phone: '',
          },
          emptyVehicles: {
            title: 'add your vehicle',
            description:
              'In order to drive, you need to add a vehicle. to drive today or later this week',
            image: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
          },
          addVehicle: {
            title: 'Vehicles requirements',
            description:
              'To drive with FTF, you need a vehicle that is form 2015 or newer, has at least 4 doors, and has not been salvaged.',
          },
        },
        passenger: null,
      },
    })
  }

  async purge(): Promise<any> {
    return this.configModel.deleteMany({})
  }
}
