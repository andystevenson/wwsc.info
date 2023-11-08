#!/usr/bin/env node

import date from 'dayjs'
import ashbourne from '../.cache/ashbourne/ashbourne.json' assert { type: 'json' }
import { isMember, isSocial, fullName } from './src/memberStatus.mjs'
import toDate from './src/ashbourne2date.mjs'
import createCacheDir from './src/createCacheDir.mjs'
import { exit } from 'process'
import { writeFileSync } from 'fs'

const jan1st = date().month(0).date(1).startOf('day')
const dateFormat = 'YYYY-MM-DD'
const social = ashbourne
  .reduce((list, member) => {
    const { Status: status, 'Mem Type': type } = member
    if (isMember(member) && isSocial(type)) {
      const startDate = toDate(member['Joined date'])
      if (startDate.isAfter(jan1st)) {
        list.push(member)
      }
      return list
    }
    return list
  }, [])
  .sort((a, b) => {
    return (
      toDate(a['Joined date']).valueOf() - toDate(b['Joined date']).valueOf()
    )
  })
  .map((member) => ({
    name: fullName(member),
    joined: toDate(member['Joined date']).format(dateFormat),
    age: date().diff(toDate(member.DOB), 'years'),
  }))

// write the cache
const cacheDir = './.cache/ashbourne'
const cacheFile = `${cacheDir}/new-social-members.json`
;(() => {
  try {
    createCacheDir(cacheDir)
    writeFileSync(cacheFile, JSON.stringify(social, null, 2))
    console.log(`cache-new-social-members is up to date`)
  } catch (error) {
    console.error(`failed to write new-social-members because [${error}]`)
    exit(1)
  }
})()
