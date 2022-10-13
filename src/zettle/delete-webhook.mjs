#!/usr/bin/env node

import { unsubscribe, list } from './webhooks.mjs'

await unsubscribe()
await list()
