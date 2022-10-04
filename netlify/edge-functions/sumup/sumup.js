import { sales } from '../../../src/deno/sumup.mjs'
import { date, lastOctober } from '../../../src/deno/dates.mjs'
import { gbp } from '../../../src/deno/gbp.mjs'

// read ytd, mtd from cache
// requires the cache to be rebuilt every day!!!
export default async (_, { log }) => {
  try {
    const today = await sales()
    const from = `${lastOctober().format('DD/MM/YYYY')} 00:00 AM`
    const to = `${date().format('DD/MM/YYYY')} 11:59 PM`
    const month = await sales({ daterange: `${from} - ${to}` })

    return new Response(
      JSON.stringify({
        today: gbp.format(today.data.summary.total_amount),
        mtd: gbp.format(month.data.summary.total_amount),
        ytd: gbp.format(month.data.summary.total_amount),
      }),
      {
        headers: { 'content-type': 'application/json' },
      },
    )
  } catch (error) {
    log(`sumup failed to fetch data [${error.message}]`)
    throw error
  }
}
