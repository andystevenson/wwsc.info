#!/usr/bin/env node
const { statSync, writeFileSync } = require('node:fs')
const { log } = require('@andystevenson/lib/logger')

const createCacheDir = require('./src/createCacheDir')
const subscriptions = require('./src/stripe-subscriptions')

const cacheDir = '.cache/stripe'
const cacheFile = `${cacheDir}/subscriptions.json`

const buildCache = async () => {
  try {
    createCacheDir(cacheDir)
    log.info(`cache-stripe-subscriptions building...`)
    const all = await subscriptions()
    writeFileSync(cacheFile, JSON.stringify(all, null, 2))
    log.info(`cache-stripe-subscriptions updated`)
  } catch (error) {
    log.error(`cache-stripe-subscriptions failed because [${error.message}]`)
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
    log.info(`cache-stripe-subscriptions is up to date`)
  } catch (error) {
    log.error(`cache-stripe-subscriptions failed because [${error.message}]`)
    process.exit(1)
  }
}

process()
