import * as log from 'https://deno.land/std/log/mod.ts'
import Stripe from 'https://esm.sh/stripe?target=deno'
import { date, lastOctober } from './dates.mjs'

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  httpClient: Stripe.createFetchHttpClient(),
})

export async function charges() {
  try {
    let all = await stripe.charges
      .list({
        created: { gt: `${lastOctober().unix()}` },
        limit: 100,
      })
      .autoPagingToArray({ limit: 10000 })

    return all
  } catch (error) {
    log.error(`stripe fetch failed [${error.message}]`)
    throw error
  }
}
