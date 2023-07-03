import {
  salesToday,
  salesMonthToDate,
  salesYearToDate,
} from '../../deno/sales.mjs'

import { lastOctoberUK } from '../../deno/dates.mjs'
import gbp from '../../deno/gbp.mjs'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function charges() {
  try {
    // const all = await stripe.charges
    //   .list({
    //     created: { gte: `${lastOctoberUK.unix()}` },
    //     limit: 100,
    //   })
    //   .autoPagingToArray({ limit: 10000 })

    // return all
    return []
  } catch (error) {
    console.error(`stripe fetch failed [${error.message}]`)
    throw error
  }
}

export const handler = async () => {
  try {
    let c = await charges()
    c = c
      .filter((charge) => charge.paid)
      .map((charge) => ({
        paid: charge.paid,
        amount: charge.amount,
        timestamp: charge.created * 1000,
      }))

    c = {
      today: gbp.format(salesToday(c)),
      mtd: gbp.format(salesMonthToDate(c)),
      ytd: gbp.format(salesYearToDate(c)),
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify(c),
    }
  } catch (error) {
    const message = `stripe error [${error.message}]`
    console.error(message)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify({ message }),
    }
  }
}
