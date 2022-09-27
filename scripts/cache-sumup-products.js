#!/usr/bin/env node

const { statSync, writeFileSync } = require('node:fs')
const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')

// make sure the cache directory exists
const cacheDir = '.cache/sumup'
const cacheFile = `${cacheDir}/sumup-products.json`

const lib = {
  category: '@andystevenson/goodtill/category',
  product: '@andystevenson/goodtill/product',
  authentication: '@andystevenson/goodtill/authentication',
}
const buildProductCategories = async () => {
  try {
    const { login, logout } = await import(lib.authentication)
    const { categories: allCategories } = await import(lib.category)
    const { products: allProducts } = await import(lib.product)

    await login()
    const categories = await allCategories()
    const products = await allProducts()
    await logout()

    return { categories, products }
  } catch (error) {
    log.error(
      `cache-sumup-products failed building product categories because [${error.message}]`,
    )
    process.exit(1)
  }
}

// buildCache
const buildCache = async () => {
  try {
    log.log(`cache-sumup-products building...`)
    createCacheDir(cacheDir)

    const categories = await buildProductCategories()
    writeFileSync(cacheFile, JSON.stringify(categories, null, 2))
  } catch (error) {
    log.error(`cache-sumup-products failed because [${error.message}]`)
    process.exit(1)
  }
}

// if the cache is a day old then rebuild it
const process = async () => {
  try {
    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    if (!cacheStat) {
      log.info(`cache-sumup-products is empty, build required`)
      return await buildCache()
    }

    const cacheDate = date(cacheStat.mtime)
    const now = date()

    const after = now.isAfter(cacheDate, 'day')

    // if cache is a day older then rebuild it
    if (after) return await buildCache()
    log.info(`cache-sumup-products is up to date`)
  } catch (error) {
    log.error(`cache-sumup-products failed because [${error.message}]`)
    process.exit(1)
  }
}

process()
