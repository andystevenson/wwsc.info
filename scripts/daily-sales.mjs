#!/usr/bin/env node

import { login, logout, authorization } from './src/sumup.mjs'
import process from 'node:process'
import createCacheDir from './src/createCacheDir.mjs'
import { date, today, lastOctoberUK, lastOctober } from './src/dates.mjs'
import { info, log, error } from 'node:console'
import { writeFileSync } from 'node:fs'

// make sure the cache directory exists
const cacheDir = '.cache/sumup/daily-sales'
const cacheFile = '.cache/sumup/daily-sales/daily-sales.json'

// sales summary
export async function dailySales(day = date()) {
  try {
    const startDay = day.startOf('day')
    const from = `${startDay.format('YYYY-MM-DD')} 00:00:00`
    const to = `${startDay.format('YYYY-MM-DD')} 23:59:59`
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
  } catch (error) {
    console.error(`sumup sales for today failed [${error.message}]`)
    throw error
  }
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

const writeDailySales = (sales) => {
  writeFileSync(cacheFile, JSON.stringify(sales, null, 2))
  info('saved', cacheFile)
}

const updateDailySales = async () => {
  try {
    await login()
    createCacheDir(cacheDir)

    console.info(`daily-sales...`)
    let targetDate = lastOctober.startOf('day')
    // let targetDate = today.subtract(1, 'week').startOf('day')

    const allSales = []
    while (targetDate.isBefore(today.startOf('day'))) {
      const sales = await dailySales(targetDate)
      const numberOfSales = sales.length
      const total = +dailyTotal(sales).toFixed(2)
      const date = targetDate.format('YYYY-MM-DD')
      const day = targetDate.format('dddd')
      info(date, day, numberOfSales, total)
      targetDate = targetDate.add(1, 'day')
      allSales.push({ date, day, numberOfSales, total })
    }

    writeDailySales(allSales)
    console.info(`daily-sales is up to date`)
    await logout()
  } catch (error) {
    console.error(`daily-sales failed because [${error.message}]`)
    process.exit(1)
  }
}

await updateDailySales()
