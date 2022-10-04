import { purchases } from '../../../src/deno/zettle.mjs'

import {
  salesToday,
  salesMonthToDate,
  salesYearToDate,
} from '../../../src/deno/sales.mjs'

import { gbp } from '../../../src/deno/gbp.mjs'
import { sortDescending } from '../../../src/deno/dates.mjs'

export default async (_, { log }) => {
  try {
    let p = await purchases()
    p = p.purchases
      .map((purchase) => ({
        amount: purchase.amount,
        timestamp: purchase.timestamp,
      }))
      .sort(sortDescending)
    p = {
      today: gbp.format(salesToday(p)),
      mtd: gbp.format(salesMonthToDate(p)),
      ytd: gbp.format(salesYearToDate(p)),
    }
    return new Response(JSON.stringify(p), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    log(`zettle error [${error.message}]`)
    throw error
  }
}
