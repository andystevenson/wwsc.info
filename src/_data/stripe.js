const subscriptions = require('../../.cache/stripe/subscriptions.json')
const customers = require('../../.cache/stripe/customers.json')

module.exports = {
  subscriptions: subscriptions.length,
  customers: customers.length,
}
