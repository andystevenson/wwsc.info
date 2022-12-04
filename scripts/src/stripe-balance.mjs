import { list } from 'postcss'
import Stripe from 'stripe'
import { inspect } from 'util'

const { STRIPE_TEST_SECRET_KEY, STRIPE_SECRET_KEY } = process.env
const apiKey = STRIPE_TEST_SECRET_KEY ?? STRIPE_SECRET_KEY

const log = (object) =>
  console.log(inspect(object, { depth: null, colors: true }))

const stripe = new Stripe(apiKey)
const listTransactions = async () => {
  const transactions = await stripe.balanceTransactions.list()
  // .autoPagingToArray({ limit: 10000 })
  log(transactions)
}

const listPayouts = async () => {
  const payouts = await stripe.payouts.list({ limit: 2 })

  for (const payout of payouts.data) {
    const balanceTransactions = await stripe.balanceTransactions.list({
      payout: payout.id,
      expand: ['data.source'],
    })

    log({ payout })
    log({ balanceTransactions })
  }
}
// listTransactions()
listPayouts()

export default listTransactions
