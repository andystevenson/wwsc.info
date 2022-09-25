require('dotenv').config()

let env = null

if (!env && process.env.STRIPE_TEST_SECRET_KEY) {
  // we're in a test environment
  const secret = process.env.STRIPE_TEST_SECRET_KEY

  const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY)
  env = {
    stripe,
    secret,
  }
}

if (!env && process.env.STRIPE_SECRET_KEY) {
  // we're in a production environment
  console.log('stripe production environment')
  const secret = process.env.STRIPE_SECRET_KEY

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  env = {
    stripe,
    secret,
  }
}

if (!env) throw Error('cannot process stripe!')

module.exports = env
