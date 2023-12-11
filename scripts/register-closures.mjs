#!/usr/bin/env node
import { login, logout, authorization } from './src/sumup.mjs'
import process from 'node:process'
import createCacheDir from './src/createCacheDir.mjs'
import {
  date,
  today,
  ordinalDateTime,
  dateRange,
  sortAscending,
} from './src/dates.mjs'
import { info, error } from 'node:console'
import { writeFileSync } from 'node:fs'
import memoize from 'lodash.memoize'

// make sure the cache directory exists
const cacheDir = '.cache/sumup/daily-sales'
const cacheFile = '.cache/sumup/daily-sales/daily-sales-register-closures.json'

// sales details between the from - to dates
export async function sales(from = date().startOf('day'), to = date()) {
  try {
    const format = 'YYYY-MM-DD HH:mm:ss'

    const limit = 50
    let offset = 0
    const params = new URLSearchParams({
      from: from.format(format),
      to: to.format(format),
      limit,
      offset,
    })

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
    error(`sumup sales failed [${err.message}]`)
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

const mProductFromId = memoize(productFromId)
const mCategoryFromId = memoize(categoryFromId)

const categoryFromProductId = async (id) => {
  const product = await mProductFromId(id)
  const category = await mCategoryFromId(product.category_id)
  return category
}

const mCategoryFromProductId = memoize(categoryFromProductId)

const parentCategoryFromProductId = async (id) => {
  const category = await mCategoryFromProductId(id)
  return category.parent_category ? category.parent_category : null
}

const writeRegisterClosures = (sales) => {
  writeFileSync(cacheFile, JSON.stringify(sales, null, 2))
  info('saved', cacheFile)
}

const salesCategories = async (salesItems) => {
  let salesByCategory = {
    WET: [],
    DRY: [],
    FOOD: [],
    ALCOHOL: [],
    DRINK: [],
    TEA_COFFEE: [],
    SNACKS: [],
    DELETED: [],
  }

  for (const sale of salesItems) {
    const { product_name, product_id, order_status } = sale
    if (order_status !== 'COMPLETED') continue

    try {
      const parentCategory = await parentCategoryFromProductId(product_id)
      if (parentCategory) {
        const category = parentCategory.name
        salesByCategory[category].push(sale)

        // define WET | DRY categories
        if (category === 'DRINK' || category === 'ALCOHOL') {
          salesByCategory['WET'].push(sale)
        }

        if (category === 'FOOD') {
          salesByCategory['DRY'].push(sale)
          const foodCategory = await categoryFromProductId(product_id)
          if (foodCategory.name === 'SNACKS') {
            salesByCategory['SNACKS'].push(sale)
          }

          if (foodCategory.name === 'TEA & COFFEE') {
            salesByCategory['TEA_COFFEE'].push(sale)
          }
        }
        continue
      }
      salesByCategory['DELETED'].push(sale)
    } catch (err) {
      console.error(err)
      salesByCategory['DELETED'].push(sale)
    }
  }

  return salesByCategory
}

const salesByRegister = async (sales) => {
  const registers = {}

  for (const sale of sales) {
    const register = sale.register.register_name

    sale.register = register

    registers[register] ??= { sales: [], items: [] }

    const current = registers[register]
    current.sales.push(sale)
    current.items = current.items.concat(sale.sales_details.sales_items)
  }

  for (const register in registers) {
    const current = registers[register]
    const { items } = current
    current.categories = await salesCategories(items)
  }

  return registers
}

const sortClosuresByTimeTo = (closures) => {
  closures.data = closures.data.sort((a, b) => {
    const aTimeTo = date(a.time_to)
    const bTimeTo = date(b.time_to)

    return sortAscending(aTimeTo, bTimeTo)
  })
}

// populate closure.sales from the list of all sales
const salesByClosure = (sales, closure) => {
  const register = closure.register_name
  const from = date(closure.time_from)
  const to = date(closure.to)
  closure.sales = []
  closure.items = []

  for (const sale of sales) {
    const saleRegister = sale.register.register_name

    // ignore sales for other registers
    if (saleRegister !== register) continue

    // ignore sales outside of the from-to time range for this closure
    const time = date(sale.sales_date_time)
    if (time.isBefore(from, 'second')) continue
    if (time.isAfter(to, 'second')) continue

    // okay we have a sale in this register's closure
    closure.sales.push(sale)
    closure.items = closure.items.concat(sale.sales_details.sales_items)
  }
}

// get all the register closures between the 2 dates (from, to)
export const registers = async (
  from = date().subtract(1, 'day').startOf('day'),
  to = from.add(1, 'day'),
) => {
  try {
    info('fetching register closures...')
    const format = 'DD/MM/YYYY hh:mm A'
    let daterange = `${from.format(format)} - ${to.format(format)}`

    const params = new URLSearchParams({ daterange })
    // const url = `https://api.thegoodtill.com/api/register_closures`
    const url = `https://api.thegoodtill.com/api/register_closures?${params}`
    // log({ url, params })
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authorization(), 'content-type': 'application/json' },
    })

    if (response.ok) {
      const json = await response.json()
      sortClosuresByTimeTo(json)
      return json
    }

    throw Error(`registers failed [${response.statusText}]`)
  } catch (e) {
    error(`registers failed [${e.message}]`)
    throw e
  }
}

// return the earliest closure.time_from and latest closure.time_to to get the
// date range of all sales

const closuresDateRange = (closures) => {
  let from = date()
  let to = date(0)

  for (const closure of closures) {
    const fromTime = date(closure.time_from)
    const toTime = date(closure.time_to)
    from = date(Math.min(+from, +fromTime))
    to = date(Math.max(+to, +toTime))
  }

  return { from, to }
}

// create a summary for each of the sales item categories
const summarizeCategories = (categories) => {
  const summaries = {}
  for (const category in categories) {
    let quantity = 0
    let grossSales = 0
    let totalSales = 0
    let discounts = 0
    let vat = 0

    for (const sale of categories[category]) {
      quantity += +sale.quantity
      grossSales += +sale.quantity * +sale.price_inc_vat_per_item
      totalSales += +sale.line_total_after_line_discount
      discounts +=
        +sale.quantity * +sale.price_inc_vat_per_item -
        +sale.line_total_after_line_discount
      vat += +sale.line_vat_after_line_discount
    }

    summaries[category] = {
      quantity: quantity,
      grossSales: +grossSales.toFixed(2),
      discounts: +discounts.toFixed(2),
      totalSales: +totalSales.toFixed(2),
      vat: +vat.toFixed(2),
      netSales: +(+totalSales.toFixed(2) - +vat.toFixed(2)).toFixed(2),
    }
  }
  return summaries
}

const run = async () => {
  const range = process.argv[2]
  let { from, to } = dateRange(range)
  await login()
  const closures = await registers(from, to)
  const n = closures.data.length
  if (!n) {
    info(`no register closures ${range ? range : 'yesterday'}`)
    await logout()
    return
  }

  // we have some closures to process
  {
    const { from, to } = closuresDateRange(closures.data)
    const allSales = await sales(from, to)
    info(closures.data.length, 'closures')
    info(allSales.length, 'sales')

    const formattedClosures = []
    for (const closure of closures.data) {
      salesByClosure(allSales, closure)
      closure.categories = await salesCategories(closure.items)
      closure.summaries = summarizeCategories(closure.categories)
      formattedClosures.push({
        register: closure.register_name,
        staff: closure.staff_name,
        from: ordinalDateTime(date(closure.time_from)),
        to: ordinalDateTime(date(closure.time_to)),
        payments: closure.payments.map((payment) => {
          if (payment.method === 'cash') {
            payment.expected = +payment.expected
            payment.counted = +payment.counted
            payment.variance = payment.expected - payment.counted
            return payment
          }

          return { [payment.method]: +payment.counted }
        }),
        total: closure.payments.reduce((total, payment) => {
          total += +payment.counted
          return total
        }, 0),
        ...closure.summaries,
      })
    }
    info('%o', formattedClosures)

    await logout()
    createCacheDir(cacheDir)
    writeFileSync('registers.json', JSON.stringify(formattedClosures, null, 2))
  }
}

run()
