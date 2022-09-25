#!/usr/bin/env node

const { statSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')

const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')
const lint = require('./src/ashbourne-lint')

const cacheDir = '.cache/ashbourne'
const csvFile = `${cacheDir}/ashbourne.csv`
const cacheFile = `${cacheDir}/ashbourne-lint.json`
const errorsFile = `${cacheDir}/ashbourne-lint-errors.json`

const doLint = async () => {
  try {
    // ensure we have somewhere to store the resource
    createCacheDir(cacheDir)

    // find out if csv is alread cached...
    const csvStat = statSync(csvFile, { throwIfNoEntry: false })
    if (!csvStat) throw Error(`cache-ashbourne-csv needs to be run first...`)

    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    const csvDate = date(csvStat.mtime)

    const cacheOutOfDate = cacheStat
      ? csvDate.isAfter(date(cacheStat.mtime))
      : true

    if (cacheOutOfDate) {
      try {
        const { errors, success } = lint(csvFile)

        if (errors) {
          log.error(`cache-ashbourne-lint failed with ${errors.n} errors!`)
          writeFileSync(errorsFile, JSON.stringify(errors, null, 2))
          return
        }
        // All okay
        writeFileSync(cacheFile, JSON.stringify(success, null, 2))
        log.info(`cache-ashbourne-lint updated`)
        return
      } catch (error) {
        const message = `cache-ashbourne-lint write failed because [${error.message}]`
        log.error(message)
        throw Error(message)
      }
    }

    // otherwise we're all up to date
    log.info(`cache-ashbourne-lint up to date`)
  } catch (error) {
    log.error(`cache-ashbourne-lint failed because [${error.message}]`)
    exit(1)
  }
}

doLint()
