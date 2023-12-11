#!/usr/bin/env node

import { login, logout, authorization } from './src/sumup.mjs'
import process from 'node:process'
import createCacheDir from './src/createCacheDir.mjs'
import { date, today, lastOctoberUK, lastOctober } from './src/dates.mjs'
import { info, log, error } from 'node:console'
import { writeFileSync } from 'node:fs'
import { pMemoize } from '@rebundled/p-memoize'

// make sure the cache directory exists
const cacheDir = '.cache/sumup/daily-sales'
const cacheFile = '.cache/sumup/daily-sales/daily-sales.json'
const cacheFileAll = '.cache/sumup/daily-sales/daily-sales-all.json'
const cacheFileItems = '.cache/sumup/daily-sales/daily-sales-items.json'

// sales summary
export async function dailySales(day = date()) {
  try {
    const startDay = day.startOf('day')
    const nextDay = day.add(1, 'day').startOf('day')
    const from = `${startDay.format('YYYY-MM-DD')} 00:00:00`
    const to = `${nextDay.format('YYYY-MM-DD')} 00:00:00`
    const limit = 50
    let offset = 0
    const params = new URLSearchParams({ from, to, limit, offset })

    let allSales = []
    let allSalesFetched = false
    do {
      const url = `https://api.thegoodtill.com/api/external/get_sales_details?${params.toString()}`
      const response = await fetch(url, {
        method: 'GET',
        headers: { ...authorization(), 'content-type': 'application/json' },
      })

      if (response.ok) {
        const json = await response.json()
        allSales = allSales.concat(json.data)
        const length = json.data.length
        allSalesFetched = length === 0

        if (!allSalesFetched) {
          params.set('offset', Number(params.get('offset')) + limit)
          continue
        }
      } else {
        throw Error(`sumup sales failed [${response.statusText}]`)
      }
    } while (!allSalesFetched)

    return allSales
  } catch (err) {
    error(`sumup sales for today failed [${err.message}]`)
    throw err
  }
}

const productFromId = async (id) => {
  const url = `https://api.thegoodtill.com/api/products/${id}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    return json.data
  }

  throw Error(`productFromId failed [${response.statusText},${id}]`)
}

const categoryFromId = async (id) => {
  const url = `https://api.thegoodtill.com/api/categories/${id}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { ...authorization(), 'content-type': 'application/json' },
  })

  if (response.ok) {
    const json = await response.json()
    return json.data
  }

  throw Error(`categoryFromId failed [${response.statusText}]`)
}

const mProductFromId = pMemoize(productFromId)
const mCategoryFromId = pMemoize(categoryFromId)

const categoryFromProductId = async (id) => {
  const product = await mProductFromId(id)
  const category = await mCategoryFromId(product.category_id)
  return category
}

const mCategoryFromProductId = pMemoize(categoryFromProductId)

const parentCategoryFromProductId = async (id) => {
  const category = await mCategoryFromProductId(id)
  return category.parent_category ? category.parent_category : null
}

const dailyTotal = (sales) => {
  const totals = sales.map((sale) => {
    const total = sale.sales_details.total_before_line_discount
    return { total }
  })
  const total = totals.reduce((sum, current) => {
    sum += Number(current.total)
    return sum
  }, 0)

  return total
}

const writeAllDailySales = (sales) => {
  writeFileSync(cacheFileAll, JSON.stringify(sales, null, 2))
  info('saved', cacheFileAll)
}

const writeDailySales = (sales) => {
  writeFileSync(cacheFile, JSON.stringify(sales, null, 2))
  info('saved', cacheFile)
}

const writeDailySalesItems = (sales) => {
  writeFileSync(cacheFileItems, JSON.stringify(sales, null, 2))
  info('saved', cacheFileItems)
}

const dailyCategoryTotal = (salesItems) => {
  const categorySalesTotal = salesItems.reduce((sum, current) => {
    const { quantity, price_inc_vat_per_item } = current
    sum = sum + quantity * price_inc_vat_per_item
    return sum
  }, 0)

  const numberOfCategoryItems = salesItems.length

  return { numberOfCategoryItems, categorySalesTotal }
}

const categorizeSales = async (salesItems) => {
  let salesByCategory = { FOOD: [], ALCOHOL: [], DRINK: [], DELETED: [] }

  for (const sale of salesItems) {
    const { product_name, product_id, order_status } = sale
    if (order_status === 'COMPLETED') {
      try {
        const parentCategory = await parentCategoryFromProductId(product_id)
        if (parentCategory) {
          salesByCategory[parentCategory.name].push(sale)
          continue
        }
        salesByCategory['DELETED'].push(sale)
      } catch (err) {
        salesByCategory['DELETED'].push(sale)
      }
    }
  }

  return salesByCategory
}

const dailySalesItems = async (sales, date, day) => {
  let items = sales.map((sale) => sale.sales_details.sales_items).flat(Infinity)

  const totalSales = items.reduce((sum, current) => {
    sum += current.quantity * current.price_inc_vat_per_item
    return sum
  }, 0)
  const numberOfSalesItems = items.length

  const salesByCategory = await categorizeSales(items)
  const result = []
  for (const category in salesByCategory) {
    const categorySales = dailyCategoryTotal(salesByCategory[category])
    result.push({
      date,
      day,
      category,
      ...categorySales,
      numberOfSalesItems,
      totalSales,
    })
  }
  return result
}

const updateDailySales = async () => {
  try {
    await login()
    createCacheDir(cacheDir)

    info(`daily-sales...`)
    // let targetDate = lastOctober.startOf('day')
    // let targetDate = today.startOf('year').startOf('day')
    let targetDate = today.subtract(1, 'day').startOf('day')
    const endDate = today.startOf('day')
    // const endDate = lastOctober.add(2, 'days')
    // let targetDate = today.subtract(2, 'day').startOf('day')

    let allDailySales = []
    const allSales = []
    let allSalesItems = []
    while (targetDate.isBefore(endDate)) {
      // deal with daily sales totals
      const sales = await dailySales(targetDate)
      allDailySales = allDailySales.concat(sales)

      const numberOfSales = sales.length
      const total = +dailyTotal(sales).toFixed(2)
      const date = targetDate.format('YYYY-MM-DD')
      const day = targetDate.format('dddd')
      info(date, day, numberOfSales, total)

      allSales.push({ date, day, numberOfSales, total })

      // deal with daily sales items
      const salesItems = await dailySalesItems(sales, date, day)
      allSalesItems = allSalesItems.concat(salesItems)

      targetDate = targetDate.add(1, 'day')
    }

    writeAllDailySales(allDailySales)
    writeDailySales(allSales)
    writeDailySalesItems(allSalesItems)
    info(`daily-sales is up to date`)
    await logout()
  } catch (err) {
    error(`daily-sales failed because [${err.message}]`)
    process.exit(1)
  }
}

await updateDailySales()
