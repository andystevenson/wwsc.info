#!/usr/bin/env node

import { exit } from 'process'
import { subscribe, defaultSubscription, list } from './webhooks.mjs'

if (!process.argv[2]) {
  console.error(`must provide a destination for the webhook update`)
  exit(1)
}

const destination = process.argv[2]
const options = { ...defaultSubscription, destination }

console.log({ options })
await subscribe(options)
await list()
