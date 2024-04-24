// updated to drive new node version for lambda functions

import Stripe from 'stripe'

const env = {
  secret: process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY,
}

const stripe = new Stripe(env.secret)
const success = { statusCode: 200 }
const fail = { statusCode: 500, body: 'success page went wrong' }

export const handler = async (event) => {
  try {
    const origin = event.headers.origin
    let target = origin
      ? `${origin}/membership`
      : 'http://localhost:8888/membership'
    let session = event.queryStringParameters.session_id
    if (session) {
      session = await stripe.checkout.sessions.retrieve(session, {
        expand: ['subscription.latest_invoice'],
      })
      if (session) {
        const { subscription } = session
        if (subscription)
          target = subscription.latest_invoice.hosted_invoice_url
      }
    }

    return {
      statusCode: 302,
      headers: {
        Location: target,
      },
    }
  } catch (error) {
    console.error(error.message)
    return { statusCode: 500, body: error.message }
  }
}
