const env = require('./stripeEnv.js')
const { stripe } = env

const list = async () => {
  const customers = await stripe.customers
    .list()
    .autoPagingToArray({ limit: 10000 })
  console.log('customer length', customers.length)
  return customers
}

module.exports = list
