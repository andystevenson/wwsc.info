const stripeJoin = require('../../.cache/stripe/join.json')
const { log } = require('@andystevenson/lib/logger')
const { cloneDeep } = require('lodash')

const getDiscountedPrices = () => {
  const clone = cloneDeep(stripeJoin)
  const discounted = clone.categories
    // .find((category) => category.name === 'membership')
    // ?.products.filter((product) => product.discounted)
    .reduce((list, category) => {
      list = list.concat(category.products)
      return list
    }, [])
    .map((product) => {
      const prices = product.prices
        // .filter((price) => price.discounted)
        .map((price) => {
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
  return discounted
}

module.exports = getDiscountedPrices()
