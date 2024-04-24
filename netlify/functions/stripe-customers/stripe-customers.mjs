// updated to drive new node version for lambda functions

import Stripe from 'stripe'

const { STRIPE_TEST_SECRET_KEY, STRIPE_SECRET_KEY } = process.env
const apiKey = STRIPE_TEST_SECRET_KEY ?? STRIPE_SECRET_KEY

const byName = async (stripe, name) => {
  return stripe.customers
    .search({ query: `name~"${name}"` })
    .autoPagingToArray({ limit: 10000 })
}

const byEmail = async (stripe, email) => {
  return stripe.customers
    .search({ query: `email~"${email}"` })
    .autoPagingToArray({ limit: 10000 })
}

export const handler = async (event) => {
  if (!apiKey) return { statusCode: 500, body: `stripe api key not set` }

  const stripe = Stripe(apiKey)
  const params = event.queryStringParameters
  const { name, email } = params

  try {
    let result = {}
    if (name) result = await byName(stripe, name)
    if (email) result = await byEmail(stripe, email)
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}
