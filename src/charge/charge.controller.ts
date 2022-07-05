import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import CreateChargeDto from './dto/createCharge.dto'
import StripeService from '../stripe/stripe.service'
import JwtAuthenticationGuard from '../auth/guards/jwt-authentication.guard'

@Controller('charge')
export default class ChargeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createCharge(@Body() charge: CreateChargeDto, @Req() request) {
    return this.stripeService.charge(
      charge.amount,
      charge.paymentMethodId,
      request.user.stripeCustomerId,
    )
  }
}
