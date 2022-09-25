const env = require('./stripeEnv.js')
const { stripe } = env

const list = async () => {
  const customers = await stripe.customers
    .list()
    .autoPagingToArray({ limit: 10000 })
  // console.log({ customer })
  return customers
}

module.exports = list
