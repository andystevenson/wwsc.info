import gbp from '../../deno/gbp.mjs'
import {
  salesToday,
  salesMonthToDate,
  salesYearToDate,
} from '../../deno/sales.mjs'

import { dateFormat, lastOctober, sortDescending } from '../../deno/dates.mjs'
import fetch from 'node-fetch'

export const env = {
  oauth: 'https://oauth.zettle.com/token',
  purchases: 'https://purchase.izettle.com/purchases/v2',
  client: process.env.ZETTLE_CLIENT_ID,
  apiKey: process.env.ZETTLE_API_KEY,
}

if (!env.client || !env.apiKey) {
  throw Error(`ZETTLE CREDENTIALS MISSING`)
}

export const accessToken = async () => {
  try {
    const params = new URLSearchParams()
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer')
    params.append('client_id', env.client)
    params.append('assertion', env.apiKey)

    const request = {
      method: 'post',
      body: `${params}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }

    const response = await fetch(env.oauth, request)
    const json = await response.json()
    env.token = json

    return json
  } catch (error) {
    throw error
  }
}

export const purchases = async (
  options = { startDate: lastOctober().format(dateFormat) },
) => {
  const token = await accessToken()
  const params = new URLSearchParams(options)

  params.append('limit', 1000)

  try {
    const url = `${env.purchases}?${params}`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const json = await response.json()

    // can only collect 1000 maximum at a time, so recurse until we have them all
    if (json.linkUrls.length > 0) {
      const { lastPurchaseHash } = json
      const merge = await purchases({ lastPurchaseHash })
      json.purchases = merge.purchases.concat(json.purchases)
    }
    return json
  } catch (error) {
    throw error
  }
}

export const handler = async () => {
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

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify(p),
    }
  } catch (error) {
    const message = `zettle error [${error.message}]`
    console.error(message)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify({ message }),
    }
  }
}
