const { inspect } = require('node:util')
const env = require('./stripeEnv.js')
const { stripe } = env

const join = require('../../src/_data/join.js')

let products = []
const listProducts = async () => {
  products = await stripe.products
    .list({ limit: 100, active: true })
    .autoPagingToArray({ limit: 10000 })
  return products
}

let prices = []
const listPrices = async () => {
  prices = await stripe.prices
    .list({ limit: 100 })
    .autoPagingToArray({ limit: 10000 })
  return prices
}

let paymentLinks = []
const listPaymentLinks = async () => {
  paymentLinks = await stripe.paymentLinks
    .list({
      limit: 100,
    })
    .autoPagingToArray({ limit: 10000 })
  return paymentLinks
}

let subscriptions = []
const listSubscriptions = async () => {
  subscriptions = await stripe.subscriptions
    .list({ status: 'active', expand: ['data.customer'] })
    .autoPagingToArray({ limit: 10000 })
  return subscriptions
}

const alreadyExists = []

const createPrices = async (stripeProduct, price) => {
  const nickname = price.nickname
  const unit_amount = price.price * 100
  const currency = 'gbp'
  let recurring =
    price.interval === 'once'
      ? null
      : { interval: price.interval, interval_count: price.interval_count || 1 }

  const product = stripeProduct.id

  let newPrice = null
  if (recurring) {
    newPrice = await stripe.prices.create({
      nickname,
      currency,
      unit_amount,
      recurring,
      product,
    })
  } else {
    newPrice = await stripe.prices.create({
      nickname,
      currency,
      unit_amount,
      product,
    })
  }

  price.id = newPrice.id
  const line_item = {
    price: newPrice.id,
    quantity: 1,
  }

  // subcriptions are recurring... others can be picked by quantity
  if (!recurring)
    line_item.adjustable_quantity = {
      enabled: true,
      minimum: 1,
      maximum: 99,
    }

  const custom_fields = price.custom_fields ? price.custom_fields : []
  const paymentLink = await stripe.paymentLinks.create({
    metadata: { name: `payment-link-${newPrice.nickname}` },
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    // automatic_tax: { enabled: true },
    line_items: [line_item],
    custom_fields,
  })

  price.paymentLink = paymentLink

  return newPrice
}

const createProducts = async () => {
  for (const category of join.categories) {
    console.log('category', category.name)

    for (const product of category.products) {
      let stripeProduct = null
      const exists = product.name in normalized

      if (exists) {
        console.log(`product ${product.name} already exists`)
        alreadyExists.push(product.name)
        stripeProduct = normalized[product.name]
        product.id = stripeProduct.id
      }

      if (!exists) {
        console.log('new product', product.name)
        const { name, description, images } = product
        const tax_code = 'txcd_00000000'
        stripeProduct = images
          ? await stripe.products.create({
              name,
              description,
              images,
              tax_code,
            })
          : await stripe.products.create({ name, description, tax_code })

        product.id = stripeProduct.id
      }

      let stripePrice = null
      for (const price of product.prices) {
        const exists = price.nickname in normalized
        if (exists) {
          console.log(`price ${price.nickname} exists`)

          alreadyExists.push(price.nickname)
          stripePrice = normalized[price.nickname]
          const stripePaymentLink = normalized[`payment-link-${price.nickname}`]
          if (stripePaymentLink) {
            price.paymentLink = stripePaymentLink
          }
          price.id = stripePrice.id
        }

        if (!exists) {
          console.log('new price', price.nickname)
          stripePrice = await createPrices(stripeProduct, price)
          price.id = stripePrice.id
        }
      }
    }
  }
}

const normalized = {}

const normalize = () => {
  // take the products and prices from stripe and normalize them into a lookup structure
  paymentLinks.forEach((link) => {
    const name = link.metadata.name
    if (name) {
      normalized[name] = link
    }
  })
  products.forEach((product) => (normalized[product.name] = product))
  prices.forEach((price) => {
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
