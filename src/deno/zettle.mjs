import * as log from 'https://deno.land/std/log/mod.ts'
import { dateFormat, lastOctober } from './dates.mjs'

export const env = {
  oauth: 'https://oauth.zettle.com/token',
  purchases: 'https://purchase.izettle.com/purchases/v2',
  client: Deno.env.get('ZETTLE_CLIENT_ID'),
  apiKey: Deno.env.get('ZETTLE_API_KEY'),
}

if (!env.client || !env.apiKey) {
  log.error('ZETTLE_CLIENT_ID and ZETTLE_API_KEY must be set')
  throw Error(`ZETTLE CREDENTIALS MISSING`)
}

export const accessToken = async () => {
  if (env.token) return env.token

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
    log.error(`zettle accessToken failed because [${error.message}]`)
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
    log.error(`zettle fetch purchases failed [${error.message}]`)
    throw error
  }
}
