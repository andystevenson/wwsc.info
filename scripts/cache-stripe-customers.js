#!/usr/bin/env node
const { statSync, writeFileSync } = require('node:fs')
const { log } = require('@andystevenson/lib/logger')

const createCacheDir = require('./src/createCacheDir')
const customers = require('./src/stripe-customers')

const cacheDir = '.cache/stripe'
const cacheFile = `${cacheDir}/customers.json`

const buildCache = async () => {
  try {
    createCacheDir(cacheDir)
    log.info(`cache-stripe-customers building...`)
    const all = await customers()
    writeFileSync(cacheFile, JSON.stringify(all, null, 2))
    log.info(`cache-stripe-customers updated`)
  } catch (error) {
    log.error(`cache-stripe-customers failed because [${error.message}]`)
    process.exit(1)
  }
}

const process = async () => {
  try {
    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    if (!cacheStat) {
      return await buildCache()
    }
    // otherwise...
    log.info(`cache-stripe-customers is up to date`)
  } catch (error) {
    log.error(`cache-stripe-customers failed because [${error.message}]`)
    process.exit(1)
  }
}

process()
