#!/usr/bin/env node

import { login, logout, authorization } from './src/sumup.mjs'
import process from 'node:process'
import createCacheDir from './src/createCacheDir.mjs'
import date from 'dayjs'
import { info, log, error } from 'node:console'

// make sure the cache directory exists
const cacheDir = '.cache/sumup/daily-sales'

// sales summary
export async function sales(daterange = null) {
  try {
    const today = date().startOf('day').subtract(1, 'day')
    const from = `${today.format('YYYY-MM-DD')} 00:00:00`
    const to = `${today.format('YYYY-MM-DD')} 23:59:59`
    const limit = 50
    const offset = 0
    const params = new URLSearchParams({ from, to, limit, offset })
    log({ from, to })
    // const url = 'https://api.thegoodtill.com/api/report/sales/summary'
    const url = `https://api.thegoodtill.com/api/external/get_sales_details?${params.toString()}`
    log({ url, params })
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authorization(), 'content-type': 'application/json' },
    })

    if (response.ok) {
      const json = await response.json()
      return json
    }

    throw Error(`sumup sales failed [${response.statusText}]`)
  } catch (error) {
    console.error(`sumup sales for today failed [${error.message}]`)
    throw error
  }
}

let allVatRates = null
const vatRates = async () => {
  if (allVatRates) return allVatRates
  const url = `https://api.thegoodtill.com/api/ajax/vat_rates`

  log({ url })
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    allVatRates = json.data
    return allVatRates
  }

  throw Error('vatRates failed')
}

let vat_rate_id = null
const vatAt20Percent = () => {
  if (vat_rate_id) return vat_rate_id

  return (vat_rate_id = allVatRates.find((rate) => rate.vat_name === '20% VAT'))
}

let allCategories = null
const categories = async () => {
  if (allCategories) return allCategories
  const url = `https://api.thegoodtill.com/api/categories`

  log({ url })
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    allCategories = json.data
    return allCategories
  }

  throw Error('categories failed')
}

let allParentCategories = null
const parentCategories = (categories) => {
  if (allParentCategories) return allParentCategories

  const parents = categories.filter(
    (category) => category.parent_category_id === null,
  )

  allParentCategories = parents
  return parents
}

const isSubcategoryOf = (category, parent) => {
  return category.parent_category_id === parent.id
}

const findParentCategory = (category) => {
  return category.parent_category ? category.parent_category : null
}

const lookupCategory = (id) => {
  return allCategories.find((category) => category.id === id)
}

let allProducts = null
const products = async () => {
  if (allProducts) return allProducts
  const url = `https://api.thegoodtill.com/api/products`

  log({ url })
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    allProducts = json.data
    return allProducts
  }

  throw Error('products failed')
}

const findProductsByCategoryName = (name) => {
  const all = allProducts.filter((product) => {
    const category = lookupCategory(product.category_id)
    if (category) {
      if (category.name === name) return true

      // might be looking by parenet category name
      const parentCategory = findParentCategory(category)
      return parentCategory.name === name
    }
    return false
  })
  return all
}

const isVariant = (product) => {
  return product.parent_product_id !== null
}

const productDetail = async (product) => {
  const url = `https://api.thegoodtill.com/api/products/${product.id}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    return json.data
  }

  error('productDetails failed', response.statusText)
  throw Error('productDetailFailed')
}

const updateAllSellingPrices = (object, percentage) => {
  object.selling_price = `${Number(object.selling_price) * (1 + percentage)}`
}

const updateSellingPrice = async (productDetail, percentage) => {
  const url = `https://api.thegoodtill.com/api/products/${productDetail.id}`

  updateAllSellingPrices(productDetail, percentage)

  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...authorization(), 'content-type': 'application/json' },
    body: JSON.stringify(productDetail),
  })

  if (response.ok) {
    const json = await response.json()
    return json.data
  } else {
    error('updateSellingPrice failed', response)
  }

  throw Error('update selling_price failed')
}

let allAlcohol = null
const alcohol = () => {
  if (allAlcohol) return allAlcohol

  const all = findProductsByCategoryName('ALCOHOL')
  return (allAlcohol = all)
}

let allSoftDrinks = null
const softDrinks = () => {
  if (allSoftDrinks) return allSoftDrinks

  const all = findProductsByCategoryName('DRINK')
  return (allSoftDrinks = all)
}

let allFood = null
const food = () => {
  if (allFood) return allFood

  const all = findProductsByCategoryName('FOOD')
  return (allFood = all)
}

const wadworth = () => {
  const all = alcohol().filter((product) =>
    product.product_name.includes('Dead Pony'),
  )
  return all
}

const updatePrices = async () => {
  try {
    await login()
    console.info(`update-prices...`)
    createCacheDir(cacheDir)
    parentCategories(await categories())

    await vatRates()

    await products()
    const all = alcohol()

    for (const product of all) {
      const category = lookupCategory(product.category_id)
      if (category) {
        // log({ category })
        const parent = findParentCategory(category)
        if (parent) {
          const detail = await productDetail(product)
          log(`updating ${detail.product_name} ...`)
          const update = await updateSellingPrice(detail, 12.5 / 100)
        } else {
          error('!!!>>>', { product, category })
        }
      } else {
        error('!!!', { product })
      }
    }
    console.info(`update-prices is up to date`)
    await logout()
  } catch (error) {
    console.error(`update-prices failed because [${error.message}]`)
    process.exit(1)
  }
}

await updatePrices()
