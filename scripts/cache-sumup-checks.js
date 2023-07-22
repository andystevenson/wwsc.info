#!/usr/bin/env node

const { statSync, readFileSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')

const { log } = require('@andystevenson/lib/logger')
const date = require('dayjs')

const createCacheDir = require('./src/createCacheDir')

const cacheDir = '.cache/sumup'
const jsonFile = `${cacheDir}/sumup-customers-updated.json`
const cacheFile = `${cacheDir}/sumup-check-card.json`
const nameFile = `${cacheDir}/sumup-check-find.json`

const checks = async () => {
  try {
    // ensure we have somewhere to store the resource
    createCacheDir(cacheDir)

    // find out if json is alread cached...
    const jsonStat = statSync(jsonFile, { throwIfNoEntry: false })
    if (!jsonStat) throw Error(`cache-sumup-updates needs to be run first...`)

    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    const jsonDate = date(jsonStat.mtime)

    const cacheOutOfDate = cacheStat
      ? jsonDate.isAfter(date(cacheStat.mtime))
      : true

    if (cacheOutOfDate) {
      try {
        const json = JSON.parse(readFileSync(jsonFile))
        const cardChecks = cardCheck(json)
        const nameChecks = nameCheck(json)
        writeFileSync(cacheFile, JSON.stringify(cardChecks))
        writeFileSync(nameFile, JSON.stringify(nameChecks))
        log.info(`cache-sumup-checks updated`)
        return
      } catch (error) {
        const message = `cache-sumup-checks write failed because [${error.message}]`
        log.error(message)
        throw Error(message)
      }
    }

    // otherwise we're all up to date
    log.info(`cache-sumup-checks up to date`)
  } catch (error) {
    log.error(`cache-sumup-checks because [${error.message}]`)
    exit(1)
  }
}

function nameCheck(sumup) {
  return sumup.reduce((checks, member) => {
    // skip invalid records
    if (!member.active) return checks

    const membership = member.membership_no
    const cardNo = member.account_code ? member.account_code : ''
    const valid = member.customer_group === 'MEMBERS'
    const name = `${member.first_name} ${member.last_name}`
    const email = member.email ? member.email : ''
    const expired = member.membership_expiry_date
    const status = member.custom_field_2
      ? member.custom_field_2.toLowerCase()
      : ''
    let expiredDate = date(expired)
    const displayStatus = expiredDate.isValid()
      ? `${status} ${expiredDate.format('DD/MM/YYYY')}`
      : status
    const now = date()
    const dob = date(member.date_of_birth)
    const age = now.diff(dob, 'years')
    checks[membership] = [valid, cardNo, name, displayStatus, email, age]
    return checks
  }, {})
}

function cardCheck(sumup) {
  return sumup.reduce((checks, member) => {
    // skip invalid records
    if (!member.active) return checks

    let cardNo = member.account_code

    if (cardNo) {
      const valid = member.customer_group === 'MEMBERS'
      const name = `${member.first_name} ${member.last_name}`
      const email = member.email ? member.email : ''
      const expired = member.membership_expiry_date
      const mobile = member.mobile
      const status = member.custom_field_2
        ? member.custom_field_2.toLowerCase()
        : ''
      let expiredDate = date(expired)
      const displayStatus = expiredDate.isValid()
        ? `${status} ${expiredDate.format('DD/MM/YYYY')}`
        : status
      const now = date()
      const dob = date(member.date_of_birth)
      const age = now.diff(dob, 'years')
      // log.info({ now, dob, age })
      cardNo = +cardNo
      if (cardNo in checks) {
        const [, existing] = checks[cardNo]
        log.error(`${cardNo} duplicate ${existing}, ${name} `)
        // don't overwrite it
        return checks
      }

      // do not store 0 card numbers
      if (cardNo) {
        checks[cardNo] = [valid, name, displayStatus, email, age, mobile]
      }
    }
    return checks
  }, {})
}

checks()
