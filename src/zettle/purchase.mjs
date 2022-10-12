import { dateFormat, lastOctober } from '../../deno/dates.mjs'

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
