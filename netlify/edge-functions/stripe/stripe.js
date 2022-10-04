import { charges } from '../../../src/deno/stripe.mjs'

import {
  salesToday,
  salesMonthToDate,
  salesYearToDate,
} from '../../../src/deno/sales.mjs'

import { gbp } from '../../../src/deno/gbp.mjs'

export default async (_, { log }) => {
  try {
    let c = await charges()
    c = c
      .filter((charge) => charge.paid)
      .map((charge) => ({
        amount: charge.amount,
        timestamp: charge.created * 1000,
      }))
    c = {
      today: gbp.format(salesToday(c)),
      mtd: gbp.format(salesMonthToDate(c)),
      ytd: gbp.format(salesYearToDate(c)),
    }
    return new Response(JSON.stringify(c), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    log(`stripe error [${error.message}]`)
    throw error
  }
}
