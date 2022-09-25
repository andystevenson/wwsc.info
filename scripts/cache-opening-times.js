#!/usr/bin/env node

const { parse } = require('node:path')
const { log } = require('@andystevenson/lib/logger')

const { statSync, writeFileSync } = require('node:fs')
const download = require('download')
const assetsByTitle = require('../src/contentful/assetsByTitle')
const date = require('dayjs')
const parseOpeningTimes = require('./src/parse-opening-times')
const createCacheDir = require('./src/createCacheDir')

const cacheDir = '.cache/opening-times'
createCacheDir(cacheDir)

const cacheRequiresRebuild = (publishedAt, url) => {
  const { base } = parse(url)
  const filename = `${cacheDir}/${base}`

  try {
    const stat = statSync(filename)
    const lastModified = date(stat.mtime)
    const after = publishedAt.isAfter(lastModified)
    return after
  } catch (error) {
    log.info(`${filename} does not exist, cache-opening-times rebuild required`)
    return true
  }
}

const buildCache = async (url) => {
  const { base, name } = parse(url)
  const filename = `${cacheDir}/${base}`
  log.info(`building cache-opening-times...`)

  // first thing to do is download the file
  try {
    await download(url, cacheDir)

    // okay downloaded the file now lets parse it
    const xlsx = parseOpeningTimes(filename)
    const output = `${cacheDir}/${name}.json`
    try {
      writeFileSync(output, JSON.stringify(xlsx, null, 2))
      log.info(`cache-opening-times updated`)
    } catch (err) {
      log.error(
        `cache-opening-times failed to write output file [${output}] because [${err.message}]`,
      )
      process.exit(1)
    }
  } catch (error) {
    log.error(
      `cache-opening-times failed to download [${url}] because [${error.message}]`,
    )
    process.exit(1)
  }
}

;(async () => {
  // lets get the opening times
  const assets = await assetsByTitle('opening-times')
  if (assets.length === 0) {
    log.error(`cache-opening-times asset 'opening-times' not in contentful`)
    process.exit(1)
  }

  if (assets.length > 1) {
    log.error(
      `cache-opening-times more than 1 asset in contentful with the title 'opening-times'`,
    )
    process.exit(1)
  }

  const { url, sys } = assets[0]
  const { publishedAt } = sys

  const published = date(publishedAt)
  if (cacheRequiresRebuild(published, url)) {
    await buildCache(url)
  } else {
    log.info(`cache-opening-times is up to date`)
  }
})()
