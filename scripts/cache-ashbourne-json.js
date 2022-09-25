#!/usr/bin/env node

const { statSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')

const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')
const csv2json = require('./src/ashbourne2json')

const cacheDir = '.cache/ashbourne'
const csvFile = `${cacheDir}/ashbourne.csv`
const lintFile = `${cacheDir}/ashbourne-lint.json`
const cacheFile = `${cacheDir}/ashbourne.json`

const toJson = async () => {
  try {
    // ensure we have somewhere to store the resource
    createCacheDir(cacheDir)

    // find out if csv is alread cached...
    const lintStat = statSync(lintFile, { throwIfNoEntry: false })
    if (!lintStat) throw Error(`cache-ashbourne-lint needs to be run first...`)

    const csvStat = statSync(csvFile, { throwIfNoEntry: false })
    if (!csvStat) throw Error(`cache-ashbourne-lint needs to be run first...`)

    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    const csvDate = date(csvStat.mtime)

    const cacheOutOfDate = cacheStat
      ? csvDate.isAfter(date(cacheStat.mtime))
      : true

    if (cacheOutOfDate) {
      try {
        const json = csv2json(csvFile)
        writeFileSync(cacheFile, JSON.stringify(json, null, 2))
        log.info(`cache-ashbourne-json updated`)
        return
      } catch (error) {
        log.error(`cache-ashbourne-json write failed because [${error}]`)
      }
    }

    // otherwise we're all up to date
    log.info(`cache-ashbourne-json up to date`)
  } catch (error) {
    log.error(`cache-ashbourne-json failed because [${error.message}]`)
    exit(1)
  }
}

toJson()
