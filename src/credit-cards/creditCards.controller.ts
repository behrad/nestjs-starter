import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  HttpCode,
} from '@nestjs/common'
import StripeService from '../stripe/stripe.service'
import AddCreditCardDto from './dto/addCreditCardDto'
import SetDefaultCreditCardDto from './dto/setDefaultCreditCard.dto'
import { EmailConfirmationGuard } from '../emailConfirmation/emailConfirmation.guard'
import JwtAuthenticationGuard from '../auth/guards/jwt-authentication.guard'

@Controller('credit-cards')
export default class CreditCardsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async addCreditCard(@Body() creditCard: AddCreditCardDto, @Req() request) {
    return this.stripeService.attachCreditCard(
      creditCard.paymentMethodId,
      request.user.stripeCustomerId,
    )
  }

  @Post('default')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async setDefaultCard(
    @Body() creditCard: SetDefaultCreditCardDto,
    @Req() request,
  ) {
    await this.stripeService.setDefaultCreditCard(
      creditCard.paymentMethodId,
      request.user.stripeCustomerId,
    )
  }

  @Get()
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  async getCreditCards(@Req() request) {
    return this.stripeService.listCreditCards(request.user.stripeCustomerId)
  }
}
