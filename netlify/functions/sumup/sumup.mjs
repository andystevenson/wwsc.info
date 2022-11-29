import { date, lastOctober } from '../../deno/dates.mjs'
import gbp from '../../deno/gbp.mjs'
import sales from './goodtill.mjs'

export const handler = async () => {
  try {
    const today = await sales()
    const from = `${date().startOf('month').format('DD/MM/YYYY')} 00:00 AM`
    const to = `${date().format('DD/MM/YYYY')} 11:59 PM`
    const month = await sales({ daterange: `${from} - ${to}` })

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify({
        today: gbp.format(today.data.summary.total_amount),
        mtd: gbp.format(month.data.summary.total_amount),
        ytd: gbp.format(month.data.summary.total_amount),
      }),
    }
  } catch (error) {
    const message = `sumup failed to fetch data [${error.message}]`
    console.error(message)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify({ message }),
    }
  }
}
