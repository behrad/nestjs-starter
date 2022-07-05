import { BadRequestException, Injectable } from '@nestjs/common'
import StripeEvent from './StripeEvent.entity'
import Stripe from 'stripe'
import { UsersService } from '../users/users.service'

@Injectable()
export default class StripeWebhookService {
  constructor(private readonly usersService: UsersService) {}

  createEvent(id: string) {
    // return this.eventsRepository.insert({ id })
  }

  async processSubscriptionUpdate(event: Stripe.Event) {
    await this.createEvent(event.id)
    const data = event.data.object as Stripe.Subscription

    const customerId: string = data.customer as string
    const subscriptionStatus = data.status

    // await this.usersService.updateMonthlySubscriptionStatus(
    //   customerId,
    //   subscriptionStatus,
    // )
  }
}
