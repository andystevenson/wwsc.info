#!/usr/bin/env node

import { login, logout, authorization } from './src/sumup.mjs'
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import date from 'dayjs'
import { info, log, error } from 'node:console'

// sales summary
export async function registers(between = null) {
  try {
    info('fetching register closures')
    let daterange = between
    if (!daterange) {
      const yesterday = date().startOf('day').subtract(1, 'day')
      const today = date().startOf('day')
      const from = `${yesterday.format('DD/MM/YYYY')} 00:00 AM`
      const to = `${today.format('DD/MM/YYYY')} 00:00 AM`
      log({ from, to })
      daterange = `${from} - ${to}`
    }
    const params = new URLSearchParams({ daterange })
    // const url = `https://api.thegoodtill.com/api/register_closures`
    const url = `https://api.thegoodtill.com/api/register_closures?${params}`
    log({ url, params })
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authorization(), 'content-type': 'application/json' },
    })

    if (response.ok) {
      const json = await response.json()
      return json
    }

    throw Error(`sumup sales failed [${response.statusText}]`)
  } catch (error) {
    console.error(`sumup sales for today failed [${error.message}]`)
    throw error
  }
}

async function run() {
  try {
    await login()
    let closures = await registers()
    writeFileSync('register-closures.json', JSON.stringify(closures, null, 2))
    console.log('done')
    await logout()
  } catch (e) {
    error(`error`, e)
    logout()
  }
}

run()
