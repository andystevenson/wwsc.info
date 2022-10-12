import fetch from 'node-fetch'

export const env = {
  oauth: 'https://oauth.zettle.com/token',
  self: 'https://oauth.zettle.com/users/self',
  pusher: 'https://pusher.izettle.com',
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
