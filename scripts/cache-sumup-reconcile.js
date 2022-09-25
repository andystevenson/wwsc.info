#!/usr/bin/env node

const { statSync, readFileSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')

const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')

const cacheDir = '.cache/sumup'
const sumupFile = `${cacheDir}/sumup-customers-updated.json`
const ashbourneFile = `.cache/ashbourne/ashbourne.json`
const outputFile = `${cacheDir}/sumup-ashbourne-reconcile.json`

const process = async () => {
  try {
    // ensure we have somewhere to store the resource
    createCacheDir(cacheDir)

    // check earlier processes run
    const sumupStat = statSync(sumupFile, { throwIfNoEntry: false })
    if (!sumupStat) throw Error(`cache-sumup-updates needs to be run first...`)

    const ashbourneStat = statSync(ashbourneFile, { throwIfNoEntry: false })
    if (!ashbourneStat)
      throw Error(`cache-ashbourne-json needs to be run first...`)

    const ashbourne = JSON.parse(readFileSync(ashbourneFile))
    const sumup = JSON.parse(readFileSync(sumupFile))

    const reconciled = reconcile(ashbourne, sumup)
    // otherwise we're all up to date
    log.info(`cache-sumup-reconcile up to date`)
  } catch (error) {
    log.error(`cache-sumup-reconcile because [${error.message}]`)
    exit(1)
  }
}

const normalize = (ashbourne, sumup) => {
  return {
    ashbourne: ashbourne.reduce((mapped, member) => {
      const memberNo = member['Member No']
      if (memberNo in mapped) {
        log.error(`${memberNo} duplicate in ashbourne!!!`)
        return mapped
      }
      mapped[memberNo] = member
      return mapped
    }, {}),
    sumup: sumup.reduce((mapped, member) => {
      const memberNo = member.membership_no
      if (member.active && memberNo in mapped) {
        log.error(
          `${memberNo}, ${member.name} duplicate of ${mapped[memberNo].name} sumup!!!`,
        )
        return mapped
      }
      mapped[memberNo] = member
      return mapped
    }, {}),
  }
}

const notInSumup = ({ ashbourne, sumup }) => {
  for (const member in ashbourne) {
    log.info(`checking ${member} in ashbourne`)
  }
}
function reconcile(ashbourne, sumup) {
  const normalized = normalize(ashbourne, sumup)
}

process()
