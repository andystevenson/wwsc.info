const env = require('./stripeEnv.js')
const { stripe } = env

const listSubscriptions = async () => {
  const subscriptions = await stripe.subscriptions
    .list({ status: 'active', expand: ['data.customer'] })
    .autoPagingToArray({ limit: 10000 })
  return subscriptions
}

module.exports = listSubscriptions
