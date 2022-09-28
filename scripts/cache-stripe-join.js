#!/usr/bin/env node
const { statSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')
const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')
const buildProducts = require('./src/build-stripe-products')

// make sure the cache directory exists
const cacheDir = '.cache/stripe'
const cacheFile = `${cacheDir}/join.json`
const joinFile = './src/_data/join.js'

const formatPrice = (price) => {
  const newPrice = Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)
  return newPrice
}

const transformPrice = (object) => {
  if ('price' in object) object.price = formatPrice(object.price)
  Object.values(object).forEach(
    (value) =>
      value !== null && typeof value === 'object' && transformPrice(value),
  )
}

// buildCache
const buildCache = async () => {
  try {
    createCacheDir(cacheDir)
    log.info(`cache-stripe-join building...`)
    const fullJoin = await buildProducts()
    transformPrice(fullJoin)
    writeFileSync(cacheFile, JSON.stringify(fullJoin, null, 2))
    log.info(`cache-stripe-join updated`)
  } catch (error) {
    log.error(`cache-stripe-join failed because [${error.message}]`)
    exit(1)
  }
}

// check to see if src/_data/join.js is newer than the cached json equivalent
const process = async () => {
  try {
    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    if (!cacheStat) {
      log.info(`cache-stripe-join is empty, build required`)
      return await buildCache()
    }
    const joinStat = statSync(joinFile)

    const cacheDate = date(cacheStat.mtime)
    const joinDate = date(joinStat.mtime)

    const after = joinDate.isAfter(cacheDate)

    // if join.js last commit date is later than the cache we have to rebuild it
    if (after) return await buildCache()

    // otherwise...
    log.info(`cache-stripe-join is up to date`)
  } catch (error) {
    log.error(`cache-stripe-join failed because [${error.message}]`)
    exit(1)
  }
}

process()
