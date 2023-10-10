#!/usr/bin/env node

const { statSync, readFileSync, writeFileSync } = require('node:fs')
const { exit } = require('node:process')
const date = require('dayjs')
const { log } = require('@andystevenson/lib/logger')
const { cloneDeep } = require('lodash')

const cacheDir = `.cache/sumup`
const cacheFile = `${cacheDir}/sumup-updates.json`
const updatedFile = `${cacheDir}/sumup-customers-updated.json`
const sumupCacheFile = `${cacheDir}/sumup-customers.json`
const ashbourneCacheFile = `.cache/ashbourne/ashbourne.json`

const createCacheDir = require('./src/createCacheDir')

const ashbourne2sumup = require('./src/ashbourne2sumup')

const { eq } = require('lodash')
const { inspect } = require('node:util')
const options = { depth: null }

function hasSameValues(a, b, verbose = false) {
  let same = true
  const diffs = []
  for (const key in a) {
    const equals = eq(a[key], b[key])
    if (!equals) {
      if (verbose) {
        const valueA = a[key]
        const typeA = typeof valueA
        const displayA = inspect(valueA, options)
        const valueB = b[key]
        const typeB = typeof valueB
        const displayB = inspect(valueB, options)
        const diff = `${key} a !== b`
        const diffa = `${typeA}, ${displayA}`
        const diffb = `${typeB}, ${displayB}`
        diffs.push(diff, diffa, diffb)
      }
      same = false
    }
  }
  return { same, diffs }
}

const mapToMembership = (members) => {
  return members.reduce((membership, member) => {
    const memberNo =
      'Member No' in member ? member['Member No'] : member.membership_no
    if (memberNo) membership[memberNo] = member
    return membership
  }, {})
}

const prepareNewMembers = (ashbourne, sumup) => {
  const newMembers = {}
  const emailDuplicates = {}

  const emails = Object.values(sumup).reduce((list, member) => {
    const { email } = member
    if (email) list.push(email)
    return list
  }, [])

  for (const memberNo in ashbourne) {
    const memberExists = memberNo in sumup

    if (memberExists) {
      // log.info(`member ${sumup[memberNo].name} already on sumup`)
      continue
    }

    const member = ashbourne[memberNo]

    // otherwise we're going to create
    const transformed = ashbourne2sumup(member)
    const { email } = transformed
    const emailExists = emails.includes(email)
    emailExists
      ? (emailDuplicates[memberNo] = transformed)
      : (newMembers[memberNo] = transformed)
    // log.info(`new sumup member ${transformed.name}`)
  }

  return { newMembers, emailDuplicates }
}

const verbose = true
const prepareMemberUpdates = (ashbourne, sumup) => {
  const updates = { ...sumup }
  for (const memberNo in updates) {
    if (memberNo in ashbourne) {
      const original = updates[memberNo]

      // only update active members (inactive sumup members are mistakes!)
      if (!original.active) {
        log.info(`skipping update to inactive member ${original.name}`)
        delete updates[memberNo]
        continue
      }

      const update = ashbourne2sumup(ashbourne[memberNo])
      update.id = updates[memberNo].id
      // do a diff
      const { same, diffs } = hasSameValues(update, original, verbose)
      if (same) {
        // log.info(`update to ${updates[memberNo].name} not required`)
        delete updates[memberNo]
      } else {
        // update required
        log.info(`updating ${updates[memberNo].name}`)
        updates[memberNo] = update
        updates[memberNo].diffs = diffs
      }
    } else {
      // there is no such customer
      const { name, customer_group } = updates[memberNo]
      const message = `${name}, number ${memberNo}, does not exist in ashbourne`
      customer_group === 'NON-MEMBERS' ? log.info(message) : log.error(message)
      delete updates[memberNo]
    }
  }
  return updates
}

const prepareUpdates = (ashbourne, sumup) => {
  try {
    const ashbourneMembers = mapToMembership(ashbourne)
    const sumupMembers = mapToMembership(sumup)
    const updates = prepareMemberUpdates(ashbourneMembers, sumupMembers)
    const { newMembers, emailDuplicates } = prepareNewMembers(
      ashbourneMembers,
      sumupMembers,
    )

    return { updates, newMembers, emailDuplicates }
  } catch (error) {
    log.error(`prepareUpdates failed with [${error.message}]`)
    throw error
  }
}

const goodtill = async (updates, newMembers, emailDuplicates) => {
  const nUpdates = Object.keys(updates).length
  const nNewMembers = Object.keys(newMembers).length
  const nEmailDuplicates = Object.keys(emailDuplicates).length

  if (nUpdates === 0) log.info(`no sumup updates`)
  if (nNewMembers === 0) log.info(`no sumup new members`)
  if (nEmailDuplicates === 0)
    log.info(`no sumup new members with duplicate emails`)

  try {
    const authentication = (
      await import('@andystevenson/goodtill/authentication')
    ).default
    const { login, logout } = authentication
    const customer = (await import('@andystevenson/goodtill/customer')).default
    const { create, update, customers } = customer

    if (!login || !logout || !create || !update) {
      log.error('cache-sumup-updates could not import @andystevenson/goodtill')
      exit(1)
    }

    // login to process the updates and new members
    await login()

    for (const member in updates) {
      const updated = await update(updates[member])
      log.info(`updated`, updated.name)
    }

    for (const member in newMembers) {
      try {
        // because emails are treated as unique in sumup, create without email
        // then add with email
        const newMember = newMembers[member]
        const email = newMember.email
        delete newMember.email

        const created = await create(newMembers[member])
        const updated = await update({
          id: created.id,
          name: created.name,
          email,
        })
        log.info(`created`, created.name)
      } catch (error) {
        const { name, email, membership_no } = newMembers[member]
        log.info(`create failed on ${name},${email},${membership_no}`)
        log.error(error.cause)
      }
    }

    for (const member in emailDuplicates) {
      try {
        const { name, email } = emailDuplicates[member]

        // clone it and remove the email duplicate which would cause the create to fail
        const clone = cloneDeep(emailDuplicates[member])
        delete clone.email

        const created = await create(clone)
        const { id } = created
        const updated = await update({ id, email })

        log.info(`created email duplicate ${name},${email}=${updated.email}`)
      } catch (error) {
        const { name, email, membership_no } = emailDuplicates[member]
        log.info(`email duplicate failed on ${name},${email},${membership_no}`)
        log.error(error)
        throw error
      }
    }

    // final step is read them all back
    const all = await customers()

    await logout()

    return all
  } catch (error) {
    log.error(
      `cache-sumup-updates with sumup/goodtill failed because [${error.message}]`,
    )
  }
}

const cacheBuildRequired = () => {
  try {
    const ashbourneStat = statSync(ashbourneCacheFile, {
      throwIfNoEntry: false,
    })

    if (!ashbourneStat) {
      log.error(`cache-ashbourne-json needs to be run first!`)
    }

    const sumupStat = statSync(sumupCacheFile, { throwIfNoEntry: false })
    if (!sumupStat) {
      log.error(`cache-sumup-customers needs to be run first!`)
    }

    // if neither inputs are there abort the process
    if (!ashbourneStat || !sumupStat) {
      log.error(
        `cache-sumup-updates aborted as ashbourne/sumup cache files missing`,
      )
      exit(1)
    }

    const cacheStat = statSync(cacheFile, { throwIfNoEntry: false })
    if (!cacheStat) return true

    const cacheDate = date(cacheStat.mtime)
    const ashbourneDate = date(ashbourneStat.mtime)
    if (ashbourneDate.isAfter(cacheDate)) return true

    const sumupDate = date(sumupStat.mtime)
    if (sumupDate.isAfter(cacheDate)) return true

    const updatedStat = statSync(updatedFile, { throwIfNoEntry: false })
    if (!updatedStat) return true

    log.info(`cache-sumup-updates is up to date`)
    return false
  } catch (error) {
    log.info(`cache-sumup-updates unexpected error [${error.message}]`)
    return true
  }
}

const readCustomers = () => {
  try {
    const ashbourne = JSON.parse(readFileSync(ashbourneCacheFile))
    const sumup = JSON.parse(readFileSync(sumupCacheFile))

    return { ashbourne, sumup }
  } catch (error) {
    log.error(
      `cache-sumup-updates aborted as input ashbourne/sumup customer caches cannot be read`,
    )
    throw error
    exit(1)
  }
}

const doUpdates = async (commit = false) => {
  try {
    createCacheDir(cacheDir)

    if (cacheBuildRequired()) {
      const { ashbourne, sumup } = readCustomers()
      const { updates, newMembers, emailDuplicates } = prepareUpdates(
        ashbourne,
        sumup,
      )

      // log.info('doUpdates...', { updates, newMembers, emailDuplicates })
      const nUpdates = Object.keys(updates).length
      const nNewMembers = Object.keys(newMembers).length
      const nEmailDuplicates = Object.keys(emailDuplicates).length
      log.info({ nUpdates, nNewMembers, nEmailDuplicates })

      const allUpdates = { updates, newMembers, emailDuplicates }
      if (commit) {
        log.info('committing updates....')
        const customers = await goodtill(updates, newMembers, emailDuplicates)
        writeFileSync(updatedFile, JSON.stringify(customers, null, 2))
        writeFileSync(cacheFile, JSON.stringify(allUpdates, null, 2))
        log.info(`cache-sumup-updates updated`)
      } else {
        log.info('skipping commit')
        writeFileSync(cacheFile, JSON.stringify(allUpdates, null, 2))
      }
    }
  } catch (error) {
    log.error(`cache-sumup-updates failed with [${error.message}]`)
    throw error
    exit(1)
  }
}

const commit = process.argv[2] === 'commit'
doUpdates(commit)
