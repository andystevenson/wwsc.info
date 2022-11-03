const join = require('../../.cache/stripe/join.json')
const { cloneDeep } = require('lodash')
const membership = cloneDeep(join.categories)

// annotate prices with paymentLinks to make the rendering more straightforward

membership
  .reduce((list, category) => {
    list = list.concat(category.products)
    return list
  }, [])
  .map((product) => {
    const prices = product.prices.map((price) => {
      const { paymentLink } = price

      const { id, active, url } = paymentLink
      const link = { id, active, url }
      price.link = link
      delete price.paymentLink
      return price
    })
    product.prices = prices
    return product
  })

module.exports = membership
