#!/usr/bin/env node

const assetsByTitle = require('../src/contentful/assetsByTitle')

const { statSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')

const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')

const cacheDir = '.cache/ashbourne'
const cacheFile = `${cacheDir}/ashbourne.csv`

const ashbourne = async () => {
  try {
    const fetch = (await import('node-fetch')).default

    // ensure we have somewhere to store the resource
    createCacheDir(cacheDir)

    // fetch the 'ashbourne' asset from contentful
    const assets = await assetsByTitle('ashbourne.csv')

    // if the asset is not there or, is ambiguous it is an error
    if (assets.length === 0) throw Error(`ashbourne asset is not present`)
    if (assets.length !== 1) throw Error(`expected single ashbourne asset`)

    const { title, url, sys } = assets[0]
    const { publishedAt } = sys

    // when was the asset published
    const assetDate = date(publishedAt)

    // find out if it already exists
    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    const cacheDate = cacheStat ? date(cacheStat.mtime) : cacheStat

    log.info(`asset ${title} published ${assetDate.format()}`)
    const cacheOutOfDate = cacheDate ? assetDate.isAfter(cacheDate) : true

    cacheDate &&
      cacheDate.isValid() &&
      log.info(`cache published ${cacheDate.format()}`)

    if (cacheOutOfDate) {
      log.info(`cache-ashbourne is out of date.... updating`)
      try {
        let csv = await fetch(url)
        csv = await csv.text()
        writeFileSync(cacheFile, csv)

        log.info(`cache-ashbourne updated`)
      } catch (error) {
        log.error(`failed to update cache-ashbourne`)
        exit(1)
      }
      return
    }

    // otherwise we're all up to date
    log.info(`cache-ashbourne up to date`)
  } catch (error) {
    log.error(`failed to cache-ashbourne because [${error.message}]`)
    exit(1)
  }
}

ashbourne()
