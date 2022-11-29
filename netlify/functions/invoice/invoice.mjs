import join from '../../../.cache/stripe/join.json' assert { type: 'json' }
import Stripe from 'stripe'

const env = {
  production: !process.env.STRIPE_TEST_SECRET_KEY,
  test: process.env.STRIPE_TEST_SECRET_KEY ?? false,
  secret: process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY,
  cancel_url: 'http://localhost:8888/membership',
  success_url: 'http://localhost:8888/membership',
}

const stripe = new Stripe(env.secret)
const success = {
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: '{}',
}

const fail = { statusCode: 500, body: `invalid /api/invoice request` }

const findPrice = (id) => {
  const find = join.categories.reduce((price, category) => {
    const find = category.products.reduce((price, product) => {
      const find = product.prices.reduce((target, price) => {
        if (price.id === id) {
          target = { price, product, category }
        }
        return target
      }, null)
      if (find) return (price = find)
      return price
    }, null)
    if (find) return (price = find)
    return price
  }, null)
  return find
}

const parse = (params) => {
  const paramsObject = Object.fromEntries(params.entries())
  return paramsObject
}

const createCustomer = async (params) => {
  let {
    name,
    email,
    postcode: postal_code,
    'address-line1': line1,
    'address-line2': addressLine2,
    street: line2,
    'address-level1': city,
  } = params
  if (addressLine2) {
    if (line1) {
      line1 = addressLine2 ? `${line1}, ${addressLine2}` : addressLine2
    }
  }

  let options = {
    name,
    email,
    address: {
      country: 'GB',
      state: 'West Midlands',
      city,
      postal_code,
      line1,
      line2,
    },
    metadata: params,
  }

  if (env.test) {
    const clock = await stripe.testHelpers.testClocks.create({
      frozen_time: Math.floor(Date.now() / 1000),
    })
    options = { ...options, test_clock: clock.id }
  }

  return await stripe.customers.create(options)
}

// create a one time invoice
const invoiceOnce = async (params, price, product, category) => {
  let customer = null
  try {
    const { 'customer-id': customerId, payment, quantity } = params
    if (!customerId) customer = await createCustomer(params)

    const invoiceOptions = {
      auto_advance: false,
      customer: customer ? customer.id : customerId,
      description: `${category.name} / ${product.name} / ${product.description}`,
      metadata: { payment },
    }

    let invoice = await stripe.invoices.create(invoiceOptions)

    const invoiceItem = {
      customer: invoiceOptions.customer,
      invoice: invoice.id,
      price: price.id,
      quantity,
      description: invoiceOptions.description,
    }

    const item = await stripe.invoiceItems.create(invoiceItem)

    if (payment === 'card') {
      invoice = await stripe.invoices.finalizeInvoice(invoice.id)
    }

    if (payment === 'cash') {
      invoice = await stripe.invoices.pay(invoice.id, {
        paid_out_of_band: true,
      })
    }
    return { invoice, item }
  } catch (error) {
    console.error({ error })
    throw error
  }
}

// create a checkout session

const createCheckoutSession = async (params, price, product, category) => {
  let customer = null
  const { 'customer-id': customerId, payment } = params
  if (!customerId) customer = await createCustomer(params)

  let options = {
    customer: customer ? customer.id : customerId,
    success_url: env.success_url,
    cancel_url: env.cancel_url,
    line_items: [{ price: price.id, quantity: 1 }],
    mode: 'subscription',
    metadata: { payment },
  }

  if (price.type) {
    const { name, description } = price
    const custom_text = {
      submit: {
        message: description ? `(${name}) ${description}` : `(${name})`,
      },
    }
    options = { ...options, custom_text }
  }
  const session = await stripe.checkout.sessions.create(options)

  return session
}
// create a subscription

const createSubscription = async (params, price, product, category) => {
  let customer = null
  const { 'customer-id': customerId, payment } = params
  if (!customerId) customer = await createCustomer(params)

  let description = `${category.name}/${product.name}/${product.description}`
  if (params.type) {
    description = price.description
      ? `(${price.name})/${price.description}/${description}`
      : `(${price.name})/${description}`
  }

  let subscription = await stripe.subscriptions.create({
    customer: customer ? customer.id : customerId,
    items: [{ price: price.id }],
    description,
    payment_behavior: 'default_incomplete',
    metadata: { payment },
    expand: ['latest_invoice'],
  })

  if (payment === 'cash') {
    let { latest_invoice } = subscription
    latest_invoice = await stripe.invoices.pay(latest_invoice.id, {
      paid_out_of_band: true,
    })
    subscription.latest_invoice = latest_invoice
  }
  return subscription
}

export const handler = async (event) => {
  const origin = event.headers.origin
  env.cancel_url = `${origin}/membership`
  env.success_url = `${origin}/api/success?session_id={CHECKOUT_SESSION_ID}`

  try {
    let params = new URLSearchParams(event.body)
    params = parse(params)
    const {
      'price-id': priceId,
      'recurring-times': recurring,
      payment,
    } = params

    const found = findPrice(priceId)
    if (!found) return fail

    const { price, product, category } = found

    if (recurring === 'once') {
      const invoiced = await invoiceOnce(params, price, product, category)
      const result = {
        ...success,
        body: JSON.stringify(invoiced),
      }
      return result
    }

    if (recurring !== 'once') {
      if (payment === 'cash') {
        const subscribed = await createSubscription(
          params,
          price,
          product,
          category,
        )
        const result = {
          ...success,
          body: JSON.stringify(subscribed),
        }
        return result
      }

      // create a checkout session
      const session = await createCheckoutSession(
        params,
        price,
        product,
        category,
      )
      const result = {
        ...success,
        body: JSON.stringify(session),
      }
      return result
    }

    return fail
  } catch (error) {
    console.error('ERROR', error.message)
    return { statusCode: 500, body: error.message }
  }
}
