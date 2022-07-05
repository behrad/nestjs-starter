import { Module } from '@nestjs/common'
import StripeWebhookController from './stripeWebhook.controller'
import { StripeModule } from '../stripe/stripe.module'
import { UsersModule } from '../users/users.module'
import StripeEvent from './StripeEvent.entity'
import StripeWebhookService from './stripeWebhook.service'

@Module({
  imports: [StripeModule, UsersModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
})
export class StripeWebhookModule {}
