import join from '../../../.cache/stripe/join.json' assert { type: 'json' }
import Stripe from 'stripe'
import { inspect } from 'util'

const env = {
  secret: process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY,
  webhook:
    process.env.STRIPE_TEST_WEBHOOK_KEY ?? process.env.STRIPE_WEBHOOK_KEY,
}

const findPriceBy = (by, id) => {
  const find = join.categories.reduce((price, category) => {
    const find = category.products.reduce((price, product) => {
      const find = product.prices.reduce((target, price) => {
        if (price[by] === id) {
          target = { price, product, category }
        }
        return target
      }, null)
      if (find) return (price = find)
      return price
    }, null)
    if (find) return (price = find)
    return price
  }, null)
  return find
}

const findPrice = (id) => findPriceBy('id', id)

const findPriceByNickname = (id) => findPriceBy('nickname', id)

const configPricePhases = (configPrice, subscriptionPrice) => {
  const newPhases = configPrice.phases.reduce((phases, phase) => {
    let newPrice = subscriptionPrice
    const { change, iterations } = phase
    if (change) {
      const { price: nextPrice } = findPriceByNickname(change)
      newPrice = nextPrice
      if (!nextPrice) throw Error(`price ${price} nickname not found`)
    }
    const newPhase = {
      items: [{ price: newPrice.id, quantity: 1 }],
      proration_behavior: 'none',
    }
    if (iterations) newPhase.iterations = iterations
    phases.push(newPhase)
    return phases
  }, [])

  return newPhases
}

const createSubscriptionSchedule = async (
  subscription,
  subscriptionPrice,
  configPrice,
) => {
  if (!configPrice.phases) return

  let schedule = await stripe.subscriptionSchedules.create({
    from_subscription: subscription.id,
  })

  let phases = schedule.phases.map((phase) => {
    const { start_date, end_date, items } = phase
    return { start_date, end_date, items }
  })

  phases = [...phases, ...configPricePhases(configPrice, subscriptionPrice)]
  schedule = await stripe.subscriptionSchedules.update(schedule.id, {
    phases,
  })
  return schedule
}
const stripe = new Stripe(env.secret)
const success = { statusCode: 200 }

export const handler = async (event) => {
  try {
    const { body, headers } = event

    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      env.webhook,
    )

    const { type } = stripeEvent
    const { object } = stripeEvent.data

    if (type === 'customer.subscription.updated') {
      console.log({ type })
      const subscription = object
      console.log('status', subscription.status, subscription.schedule)
      if (subscription.status !== 'active') return success
      if (subscription.schedule) return success

      let subscriptionPrice = subscription.items?.data[0]?.price
      const { price: configPrice } = findPrice(subscriptionPrice.id)

      console.log({ configPrice, subscriptionPrice })
      let schedule = null
      if (configPrice.phases)
        schedule = await createSubscriptionSchedule(
          subscription,
          subscriptionPrice,
          configPrice,
        )

      console.log({ schedule })
      return success
    }

    return success
  } catch (error) {
    console.error(error.message)
    return { statusCode: 500, body: error.message }
  }
}
