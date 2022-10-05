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
    writeFileSync(outputFile, JSON.stringify(reconciled))

    // otherwise we're all up to date
    log.info(`cache-sumup-reconcile up to date`)
  } catch (error) {
    log.error(`cache-sumup-reconcile because [${error.message}]`)
    exit(1)
  }
}

function reconcile(ashbourne, sumup) {
  const duplicates = {
    ashbourne: [],
    sumup: [],
    names: [],
    email: [],
  }

  // check ashbourne for duplicate membership no's
  log.info(`ashbourne checking duplicate 'Member No'...`)
  ashbourne.reduce((mapped, member) => {
    const memberNo = member['Member No']
    if (memberNo in mapped) {
      const message = `${memberNo} duplicate`
      // log.error(`${memberNo} duplicate in ashbourne`)
      duplicates.ashbourne.push(message)
      return mapped
    }
    mapped[memberNo] = member
    return mapped
  }, {})
  log.info(`duplicates ${duplicates.ashbourne.length}`)

  // check ashbourne for duplicate membership no's
  log.info(`sumup checking duplicate 'membership_no'...`)

  sumup.reduce((mapped, member) => {
    const memberNo = member.membership_no
    if (member.active && memberNo in mapped) {
      const message = `${memberNo}, ${member.name} duplicate of ${mapped[memberNo].name}`
      // log.error(`${message} sumup`)
      duplicates.sumup.push(message)
      return mapped
    }
    mapped[memberNo] = member
    return mapped
  }, {})
  log.info(`duplicates ${duplicates.sumup.length}`)

  // check sumup for duplicate names
  log.info(`sumup checking duplicate full names...`)

  sumup.reduce((mapped, member) => {
    const { name } = member
    if (name in mapped) {
      const { membership_no } = member
      const { membership_no: other } = mapped[name]
      const message = `${membership_no}, ${name} duplicate name ${other}`
      // log.warn(`${message} sumup`)
      duplicates.names.push(message)
      return mapped
    }
    mapped[name] = member
    return mapped
  }, {})
  log.info(`duplicates ${duplicates.names.length}`)

  // check sumup for duplicate email
  log.info(`sumup checking duplicate email...`)

  sumup.reduce((mapped, member) => {
    const { email } = member
    if (email && email in mapped) {
      const { name, membership_no } = member
      const { name: otherName, membership_no: other } = mapped[email]
      const message = `[${email}], ${name} ${membership_no} duplicate email ${otherName} ${other}`
      // log.warn(`${message} sumup`)
      duplicates.email.push(message)
      return mapped
    }
    mapped[email] = member
    return mapped
  }, {})
  log.info(`duplicates ${duplicates.email.length}`)

  return duplicates
}

process()
