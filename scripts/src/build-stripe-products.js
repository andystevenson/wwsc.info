const env = require('./stripeEnv.js')
const { stripe } = env

const join = require('../../src/_data/join.js')

let products = []
const listProducts = async () => {
  products = await stripe.products.list({ limit: 100, active: true })
  return products
}

let prices = []
const listPrices = async () => {
  prices = await stripe.prices.list({ limit: 100 })
  return prices
}

let paymentLinks = []
const listPaymentLinks = async () => {
  paymentLinks = await stripe.paymentLinks.list({
    limit: 100,
  })
  return paymentLinks
}

let subscriptions = []
const listSubscriptions = async () => {
  subscriptions = await stripe.subscriptions
    .list({ status: 'active', expand: ['data.customer'] })
    .autoPagingToArray({ limit: 10000 })
  // console.log({ subscriptions })
  return subscriptions
}

const alreadyExists = []

const createPrices = async (stripeProduct, price) => {
  const nickname = price.nickname
  const unit_amount = price.price * 100
  const currency = 'gbp'
  const tax_behavior = 'inclusive'
  const recurring =
    price.interval === 'once' ? null : { interval: price.interval }
  const product = stripeProduct.id

  let newPrice = null
  if (recurring) {
    newPrice = await stripe.prices.create({
      nickname,
      currency,
      unit_amount,
      tax_behavior,
      recurring,
      product,
    })
  } else {
    newPrice = await stripe.prices.create({
      nickname,
      currency,
      unit_amount,
      tax_behavior,
      product,
    })
  }

  const paymentLink = await stripe.paymentLinks.create({
    metadata: { name: `payment-link-${newPrice.nickname}` },
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    automatic_tax: { enabled: true },
    line_items: [
      {
        price: newPrice.id,
        quantity: 1,
      },
    ],
  })

  price.paymentLink = paymentLink

  return newPrice
}

const createProducts = async () => {
  const withDummies = process.env.TEST_DUMMIES
  if (withDummies) console.log('processing with test dummies')

  for (const category of join.categories) {
    console.log('category', category.name)

    for (const product of category.products) {
      let stripeProduct = null
      const exists = product.name in normalized

      if (!withDummies && product.name.startsWith('Dummy')) continue

      if (exists) {
        alreadyExists.push(product.name)
        stripeProduct = normalized[product.name]
      }

      if (!exists) {
        console.log('new product', product.name, exists)
        const { name, description, images } = product
        stripeProduct = images
          ? await stripe.products.create({ name, description, images })
          : await stripe.products.create({ name, description })
      }

      let stripePrice = null
      for (const price of product.prices) {
        const exists = price.nickname in normalized
        if (exists) {
          alreadyExists.push(price.nickname)
          stripePrice = normalized[price.nickname]
          const stripePaymentLink = normalized[`payment-link-${price.nickname}`]
          if (stripePaymentLink) {
            price.paymentLink = stripePaymentLink
          }
        }

        if (!exists) {
          console.log('new price', price.nickname, exists)

          stripePrice = await createPrices(stripeProduct, price)
        }
      }
    }
  }
}

const normalized = {}

const normalize = () => {
  // take the products and prices from stripe and normalize them into a lookup structure
  paymentLinks.data.forEach((link) => {
    const name = link.metadata.name
    if (name) {
      normalized[name] = link
    }
  })
  products.data.forEach((product) => (normalized[product.name] = product))
  prices.data.forEach((price) => {
    if (price.nickname) {
      normalized[price.nickname] = price
    }
  })
}

const assets = async () => {
  await listProducts()
  await listPrices()
  await listPaymentLinks()
  await listSubscriptions()
  normalize()
  await createProducts()

  return Promise.resolve(join)
}

module.exports = assets
