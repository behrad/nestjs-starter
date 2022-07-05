import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'
import TokenPayload from './tokenPayload.interface'
import RegisterDto from './dto/register.dto'
import { ROLE } from './role.enum'
import { AppAgentInfo } from '../decorators/user-agent.decorator'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const admins = await this.usersService.findAdmins()
    if (!admins.length) {
      const adminUser: RegisterDto = {
        email: this.configService.get('ADMIN_EMAIL'),
        password: this.configService.get('ADMIN_PASSWORD'),
        phoneNumber: this.configService.get('ADMIN_PHONE'),
        role: ROLE.ADMIN,
      }
      await this.register(adminUser)
      this.logger.log('Created ADMIN user')
    }
  }

  public async register(registrationData: RegisterDto) {
    const createdUser = await this.usersService.create({
      ...registrationData,
      role: registrationData.role || ROLE.USER,
      password: await bcrypt.hash(registrationData.password, 10),
    })
    createdUser.password = undefined
    return createdUser
  }

  public async registerUserByPhoneNumber(
    phoneNumber: string,
    userAgent: AppAgentInfo,
  ) {
    let isNew = false
    let user = await this.usersService.findByPhoneNumber(phoneNumber)
    if (user) {
      // user.phoneNumber = phoneNumber
      // user.isPhoneNumberConfirmed = true
      // user.role = userAgent.role
      // user.platform = userAgent.platform
      // await user.update()
    } else {
      user = await this.usersService.registerByPhoneNumber({
        phoneNumber,
        role: userAgent.role,
        platform: userAgent.platform,
        isPhoneNumberConfirmed: true,
        password: await bcrypt.hash(Math.random() + '', 10),
      })
      isNew = true
    }

    const { token, cookie } = this.getCookieWithJwtAccessToken(
      user.id,
      user.role,
    )
    const { token: refreshToken, cookie: refreshCookie } =
      this.getCookieWithJwtRefreshToken(user.id, user.role)
    return {
      userId: user.id,
      isNew,
      cookie,
      refreshCookie,
      token,
      refreshToken,
    }
  }

  public getCookieWithJwtAccessToken(userId: string, role: string) {
    const payload: TokenPayload = { userId, role }
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    })
    const cookie = {
      key: 'Authentication',
      value: token,
      options: {
        //  maxAge: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    }
    // this like would handle with fastify-cookie
    // `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
    //   'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    // )}`
    return {
      cookie,
      token,
    }
  }

  public getCookieWithJwtRefreshToken(userId: string, role: string) {
    const payload: TokenPayload = { userId, role }
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    })

    const cookie = {
      key: 'Refresh',
      value: token,
      options: {
        maxAge:
          +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1,
      },
    }
    // const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
    //   'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    // )}`
    return {
      cookie,
      token,
    }
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ]
  }

  async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email)
      await this.verifyPassword(password, user.password)
      return user
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    )
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    })
    if (payload.userId) {
      return this.usersService.findOne(payload.userId)
    }
  }
}
