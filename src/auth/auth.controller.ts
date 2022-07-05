import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import JwtAuthenticationGuard from './guards/jwt-authentication.guard'
import JwtRefreshGuard from './guards/jwt-refresh.guard'
import { LocalAuthenticationGuard } from './guards/localAuthentication.guard'
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import RegisterDto from './dto/register.dto'
import LogInDto from './dto/logIn.dto'
import { RoleGuard } from './guards/role.guard'
import { Roles } from './decorators/role.decorator'
import { ROLE } from './role.enum'
import { User } from './decorators/user.decorator'
import { UserDocument } from '../users/user.schema'
import RequestVerificationCodeDto from './dto/requestVerificationCode.dto'
import CheckVerificationCodeDto from './dto/checkVerificationCode.dto'
import {
  AppAgent,
  AppAgentInfo,
  Platform,
} from '../decorators/user-agent.decorator'
import SmsService from '../sms/sms.service'
import { InputValidationException } from '../filters/input-validation.exception'
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
    private readonly usersService: UsersService, // private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @HttpCode(200)
  @ApiOperation({ summary: 'Register an admin dashboard user' })
  @ApiResponse({
    status: 200,
    description: 'The created user',
    type: RegisterDto,
  })
  @ApiBearerAuth('JWT-Token')
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.ADMIN)
  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    const user = await this.authService.register(registrationData)
    // await this.emailConfirmationService.sendVerificationLink(
    //   registrationData.email,
    // )
    return user
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @ApiOperation({ summary: 'Login to admin dashboard' })
  @Post('login')
  @ApiBody({ type: LogInDto })
  async logIn(@Req() request, @User() user: UserDocument) {
    const { cookie, token } = this.authService.getCookieWithJwtAccessToken(
      user.id,
      user.role,
    )
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id, user.role)
    await this.usersService.setCurrentRefreshToken(refreshToken, user.id)
    // request.res.header('Set-Cookie', [cookie, refreshTokenCookie])

    request.res.setCookie(cookie.key, cookie.value, cookie.options)
    request.res.setCookie(
      refreshTokenCookie.key,
      refreshTokenCookie.value,
      refreshTokenCookie.options, // override maxAge
    )
    return {
      user: {
        id: user.id,
        role: user.role,
      },
      token,
      refreshToken,
    }
  }

  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('JWT-Token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout from admin dashboard' })
  @HttpCode(200)
  async logOut(@Req() request) {
    request.res.header('Set-Cookie', this.authService.getCookiesForLogOut())
    return await this.usersService.removeRefreshToken(request.user.id)
  }

  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('JWT-Token')
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user information' })
  authenticate(@Req() request) {
    return request.user
  }

  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh JWT token expiry' })
  @Get('refresh')
  refresh(@Req() request) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
      request.user.role,
    )
    request.res.setCookie(
      accessTokenCookie.cookie.key,
      accessTokenCookie.cookie.value,
      accessTokenCookie.cookie.options,
    )
    return request.user
  }

  @ApiOperation({ summary: 'Request a verification code for a mobile user' })
  @Post('send-otp')
  @ApiHeader({ name: 'App-Agent' })
  async initiatePhoneNumberVerification(
    @AppAgent() agentInfo,
    @Body() payload: RequestVerificationCodeDto,
  ) {
    // todo You could not log in due to three wrong tries. Please wait and try again in 5 minutes
    // todo Your account is suspended. Please contact us through the help page.
    const phoneNumber = this.smsService.toPhoneNumberWithCountryCode(payload)
    const suspended = await this.usersService.isPhoneNumberSuspendedUser(
      phoneNumber,
    )
    if (suspended) {
      throw new InputValidationException(
        'Your account is suspended. Please contact us through the help page',
      )
    }
    return await this.smsService.initiatePhoneNumberVerification(
      phoneNumber,
      agentInfo.role,
    )
  }

  @ApiHeader({ name: 'App-Agent' })
  @ApiOperation({ summary: 'Confirm a verification code for a mobile user' })
  @Post('verify-otp')
  async checkVerificationCode(
    @Req() request,
    @Body() verificationData: CheckVerificationCodeDto,
    @AppAgent() userAgent: AppAgentInfo,
  ) {
    const phoneNumberWithCountryCode =
      this.smsService.toPhoneNumberWithCountryCode(verificationData)
    await this.smsService.confirmPhoneNumber(
      phoneNumberWithCountryCode,
      verificationData.code,
      userAgent,
    )
    const { cookie, refreshCookie, token, refreshToken, userId, isNew } =
      await this.authService.registerUserByPhoneNumber(
        phoneNumberWithCountryCode,
        userAgent,
      )

    if (userAgent.platform == Platform.Web) {
      request.res.setCookie(cookie.key, cookie.value, cookie.options)
      request.res.setCookie(
        refreshCookie.key,
        refreshCookie.value,
        refreshCookie.options, // override maxAge
      )
    }

    return {
      token,
      refreshToken,
      userId,
      isNew,
    }
  }
}
