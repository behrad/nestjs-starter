import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import JwtAuthenticationGuard from '../auth/guards/jwt-authentication.guard'
import { RoleGuard } from '../auth/guards/role.guard'
import { ROLE } from '../auth/role.enum'
import { Roles } from '../auth/decorators/role.decorator'
import { User } from '../auth/decorators/user.decorator'
import { UserUpdateDto } from './user-update.dto'
import { ResetPasswordDto } from './reset-password.dto'
import { ChangePasswordDto } from './change-password.dto'

@ApiTags('Users')
@Controller('users')
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Return list of users' })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth('JWT-Token')
  @Get('/')
  async getAllUsers() {
    return this.usersService.findAll()
  }

  @ApiOperation({ summary: 'Return user with specific id' })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.ADMIN)
  @ApiBearerAuth('JWT-Token')
  @Get(':id')
  async getUser(@Param() { id }) {
    return this.usersService.findOne(id)
  }

  @ApiOperation({ summary: 'Update user information' })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Roles(ROLE.DRIVER, ROLE.PASSENGER)
  @ApiBearerAuth('JWT-Token')
  @Patch('/')
  async updateUser(@User() user, @Body() userUpdateDto: UserUpdateDto) {
    return this.usersService.update(user, userUpdateDto)
  }

  @ApiOperation({ summary: 'Reset users password by email' })
  @Patch('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto.email)
  }

  @ApiOperation({ summary: 'Change users password' })
  @Patch('/change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(
      changePasswordDto.token,
      changePasswordDto.newPassword,
    )
  }
}
