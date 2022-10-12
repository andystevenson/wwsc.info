// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
import { list } from '../../../src/zettle/webhooks.mjs'
import crypto from 'node:crypto'

export const handler = async ({ headers, body }) => {
  try {
    const subscriptions = await list()
    if (subscriptions.length !== 1) {
      console.error(`zettle webhooks subscription not found`)
      return { statusCode: 401 }
    }

    const { signingKey } = subscriptions[0]

    console.log({ signingKey, headers, body })

    const json = JSON.parse(body)
    const { timestamp, payload } = json
    const crypted = crypto
      .createHmac('sha256', signingKey)
      .update(`${timestamp}.${payload}`)
      .digest('hex')

    const signature = headers['x-izettle-signature']
    if (crypted !== signature) {
      // payload not from zettle
      console.error(`zettle webhooks payload not matching signature`)
      return { statusCode: 401 }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello Zettle Webhooks` }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}
