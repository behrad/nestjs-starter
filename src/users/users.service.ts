import { Model } from 'mongoose'
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './user.schema'
import { NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ROLE } from '../auth/role.enum'
import { UserUpdateDto } from './user-update.dto'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import EmailService from '../email/email.service'
import { InputValidationException } from '../filters/input-validation.exception'

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new NotFoundException()
    }
    return user
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email: email }).exec()
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    const email = `${phoneNumber}@domain.com`
    return this.findByEmail(email)
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec()
  }

  async findAdmins(): Promise<User[]> {
    return await this.userModel.find({ role: ROLE.ADMIN }).exec()
  }

  async create(newUser /*CreateUserDto*/): Promise<User> {
    if (this.isValidEmail(newUser.email) && newUser.password) {
      const userRegistered = await this.findByEmail(newUser.email)
      if (!userRegistered) {
        // newUser.password = await bcrypt.hash(newUser.password, 10)
        const createdUser = new this.userModel(newUser)
        // createdUser.roles = ['User']
        return await createdUser.save()
        // } else if (!userRegistered.auth.email.valid) {
        //   return userRegistered
      } else {
        throw new HttpException(
          'REGISTRATION.USER_ALREADY_REGISTERED',
          HttpStatus.FORBIDDEN,
        )
      }
    } else {
      throw new HttpException(
        'REGISTRATION.MISSING_MANDATORY_PARAMETERS',
        HttpStatus.FORBIDDEN,
      )
    }
  }

  async update(user: User, userUpdateDto: UserUpdateDto) {
    return this.userModel.findByIdAndUpdate({ _id: user.id }, userUpdateDto, {
      new: true,
    })
  }

  async registerByPhoneNumber(newUser): Promise<User> {
    newUser.email = `${newUser.phoneNumber}@mail.ftft.uk`
    const user = await this.create(newUser)
    user.password = undefined
    return user
  }

  async isPhoneNumberSuspendedUser(phoneNumber): Promise<boolean> {
    const existingUser = await this.findByPhoneNumber(phoneNumber)
    if (existingUser) {
      return existingUser.suspended
    }
    return false
  }

  isValidEmail(email: string) {
    if (email) {
      const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    } else return false
  }

  async resetPassword(email: string) {
    const user = await this.findByEmail(email)
    if (!user) {
      throw new InputValidationException('Email not found')
    }
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        expiresIn: `${this.configService.get(
          'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
        )}s`,
      },
    )

    const url = `${this.configService.get('FRONTEND_URL')}?token=${token}`
    const text = `Hi ${user.name || user.email}

We received a request to reset your account password.
you can directly change your password by just clicking on the link below.

${url}

Didn't request this change?
If you didn't request a new password, let us know. `

    return this.emailService.sendMail({
      to: email,
      subject: 'Reset your password',
      text,
    })
  }

  async changePassword(token: string, newPassword: string): Promise<boolean> {
    const email = await this.decodeConfirmationToken(token)
    const userFromDb = await this.findByEmail(email)
    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND)

    userFromDb.password = await bcrypt.hash(newPassword, 10)
    await userFromDb.save()
    return true
  }

  public async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      })

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email
      }
      throw new BadRequestException()
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new InputValidationException('Email confirmation token expired')
      }
      throw new BadRequestException('Bad confirmation token')
    }
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findOne(userId)

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    )

    if (isRefreshTokenMatching) {
      return user
    }
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    // await this.userModel.update(userId, {
    //   currentHashedRefreshToken,
    // })
  }

  async removeRefreshToken(userId: string) {
    // return this.usersRepository.update(userId, {
    //   currentHashedRefreshToken: null
    // });
  }
}
