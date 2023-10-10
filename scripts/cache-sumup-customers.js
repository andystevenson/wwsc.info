#!/usr/bin/env node

const { statSync, writeFileSync } = require('node:fs')
const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')

// make sure the cache directory exists
const cacheDir = '.cache/sumup'
createCacheDir(cacheDir)

const cacheFile = `${cacheDir}/sumup-customers.json`

const assertIntegrity = (customers) => {
  // throw if there are membership_no duplications
  customers.reduce((members, member) => {
    const mno = member.membership_no
    // log.info(`checking ${mno}`)
    if (member.active && mno && mno in members) {
      log.error(`duplicate [${mno}],${member.name} with ${members[mno].name}`)
      return members
    }
    members[mno] = member
    return members
  }, {})
  return customers
}

const fetchCustomers = async () => {
  try {
    const { login, logout } = await import(
      '@andystevenson/goodtill/authentication'
    )
    const { customers } = await import('@andystevenson/goodtill/customer')
    await login()
    const all = await customers()
    await logout()
    return assertIntegrity(all)
  } catch (error) {
    log.error(
      `cache-sumup-customers failed fetching customers because [${error.message}]`,
    )
    process.exit(1)
  }
}

// buildCache
const buildCache = async () => {
  try {
    log.log(`cache-sumup-customers building...`)
    const customers = await fetchCustomers()
    writeFileSync(cacheFile, JSON.stringify(customers, null, 2))
  } catch (error) {
    log.error(`cache-sumup-customers failed because [${error.message}]`)
    process.exit(1)
  }
}

// if the cache is a day old then rebuild it
const process = async () => {
  try {
    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    if (!cacheStat) {
      log.info(`cache-sumup-customers is empty, build required`)
      return await buildCache()
    }

    const cacheDate = date(cacheStat.mtime)
    const now = date()

    const after = now.isAfter(cacheDate, 'day')

    // if cache is a day older then rebuild it
    if (after) return await buildCache()
    log.info(`cache-sumup-customers is up to date`)
  } catch (error) {
    log.error(`cache-sumup-customers failed because [${error.message}]`)
    process.exit(1)
  }
}

process()
