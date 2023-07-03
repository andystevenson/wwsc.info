#!/usr/bin/env node

import process from 'node:process'
import createCacheDir from './src/createCacheDir.mjs'
import { info, log, error } from 'node:console'
import { readFileSync, writeFileSync } from 'node:fs'
import { Parser } from '@json2csv/plainjs'

// make sure the cache directory exists
const input = '.cache/sumup/daily-sales/daily-sales.json'
const output = '.cache/sumup/daily-sales/daily-sales.csv'
const boundsOutput = '.cache/sumup/daily-sales/daily-sales-bounds.csv'
const itemsInput = '.cache/sumup/daily-sales/daily-sales-items.json'
const itemsOutput = '.cache/sumup/daily-sales/daily-sales-items.csv'
let itemsBoundsOutput =
  '.cache/sumup/daily-sales/daily-sales-<category>-bounds.csv'

const MAX = Number.MAX_SAFE_INTEGER

const salesBounds = (sales) => {
  const data = {
    All: { day: 'All', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Monday: { day: 'Monday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Tuesday: { day: 'Tuesday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Wednesday: { day: 'Wednesday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Thursday: { day: 'Thursday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Friday: { day: 'Friday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Saturday: { day: 'Saturday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Sunday: { day: 'Sunday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
  }

  sales.forEach((sale) => {
    const { day, total } = sale

    {
      // all sales
      let { min, ave, max, sum, count } = data.All
      count += 1
      min = Math.min(min, total)
      max = Math.max(max, total)
      sum = sum + total
      ave = sum / count

      data.All = { day: 'All', min, ave, max, sum, count }
    }
    {
      // for Monday, Tuesday ... sales
      let { min, ave, max, sum, count } = data[day]
      count += 1
      min = Math.min(min, total)
      max = Math.max(max, total)
      sum = sum + total
      ave = sum / count

      data[day] = { day, min, ave, max, sum, count }
    }
  })
  return data
}

const formatSalesBounds = (bounds) => {
  const formatted = Object.values(bounds)

  // log({ formatted })
  return formatted
}

const salesItemsBounds = (items, category) => {
  const data = {
    All: { day: 'All', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Monday: { day: 'Monday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Tuesday: { day: 'Tuesday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Wednesday: {
      day: 'Wednesday',
      min: MAX,
      ave: 0,
      max: 0,
      sum: 0,
      count: 0,
    },
    Thursday: { day: 'Thursday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Friday: { day: 'Friday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Saturday: { day: 'Saturday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
    Sunday: { day: 'Sunday', min: MAX, ave: 0, max: 0, sum: 0, count: 0 },
  }

  items
    .filter((item) => item.category === category)
    .forEach((sale) => {
      const { day, categorySalesTotal } = sale

      {
        // all sales
        let { min, ave, max, sum, count } = data.All
        count += 1
        min = Math.min(min, categorySalesTotal)
        max = Math.max(max, categorySalesTotal)
        sum = sum + categorySalesTotal
        ave = sum / count

        data.All = { day: 'All', min, ave, max, sum, count }
      }
      {
        // for Monday, Tuesday ... sales
        let { min, ave, max, sum, count } = data[day]
        count += 1
        min = Math.min(min, categorySalesTotal)
        max = Math.max(max, categorySalesTotal)
        sum = sum + categorySalesTotal
        ave = sum / count

        data[day] = { day, min, ave, max, sum, count }
      }
    })
  return data
}

const sales2csv = () => {
  try {
    info('reading input...')

    // sales totals first...
    let parser = new Parser()
    let json = JSON.parse(readFileSync(input))
    let csv = parser.parse(json)

    info('writing sales output...')
    writeFileSync(output, csv)

    // sales bounds next...
    parser = new Parser()
    const bounds = formatSalesBounds(salesBounds(json))
    csv = parser.parse(bounds)
    info('writing sales bounds output...')
    writeFileSync(boundsOutput, csv)

    // sales items next ..
    parser = new Parser()
    json = JSON.parse(readFileSync(itemsInput))
    csv = parser.parse(json)
    info('writing sales items output...')
    writeFileSync(itemsOutput, csv)

    // sales items bounds ...
    for (const category of ['FOOD', 'ALCOHOL', 'DRINK', 'DELETED']) {
      parser = new Parser()
      itemsBoundsOutput = itemsBoundsOutput.replace('<category>', category)
      const itemsBounds = formatSalesBounds(salesItemsBounds(json, category))
      csv = parser.parse(itemsBounds)
      info(`writing ${category} sales items bounds output...`)
      writeFileSync(itemsBoundsOutput, csv)
      itemsBoundsOutput = itemsBoundsOutput.replace(category, '<category>')
    }

    // done
    info('done')
  } catch (err) {
    console.error(err)
  }
}

sales2csv()
