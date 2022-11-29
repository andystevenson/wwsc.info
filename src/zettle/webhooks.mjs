import { write, writeFileSync } from 'node:fs'
import fetch from 'node-fetch'
import { env, accessToken } from './zettle.mjs'
import createCacheDir from '../js/createCacheDir.mjs'
const cacheDir = '.cache/zettle'
const subscriptionFile = `${cacheDir}/webhook.subscription.json`
const updateFile = `${cacheDir}/webhook.subscription-update.json`
const unsubscribeFile = `${cacheDir}/webhook.unsubscribe.json`
const subscriptionListFile = `${cacheDir}/webhook.subscription-list.json`
const selfFile = `${cacheDir}/webhook.self.json`

const uuid = process.env.ZETTLE_V1_UUID

if (!uuid) throw Error(`zettle v1 uuid required!`)

let headers = null
let token = null

export const init = async () => {
  if (headers && token) return
  try {
    token = await accessToken()
    headers = {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json; charset="utf-8"',
    }
    createCacheDir(cacheDir)
  } catch (error) {
    console.error(`zettle failed to get access token`)
    throw error
  }
}

export const defaultSubscription = {
  uuid,
  transportName: 'WEBHOOK',
  eventNames: ['PurchaseCreated'],
  destination: 'https://westwarwicks.info/webhooks/zettle',
  contactEmail: 'andystevenson@mac.com',
}

export async function subscribe(options = defaultSubscription) {
  const url = `${env.pusher}/organizations/self/subscriptions`

  const body = JSON.stringify(options)

  try {
    await init()
    const response = await fetch(url, { method: 'POST', headers, body })
    if (response.ok) {
      const json = await response.json()
      writeFileSync(subscriptionFile, JSON.stringify(json))
      return json
    }

    throw Error(
      `zettle webhook subscribe response failed [${response.status}][${response.statusText}]`,
    )
  } catch (error) {
    console.error(`zettle webhook subscribe failed [${error.message}]`)
    throw error
  }
}

export const defaultUpdate = {
  eventNames: ['PurchaseCreated'],
  // destination: 'https://webhook.site/4469bbdf-4f80-484f-b5ac-4b88bd6d71de',
  destination: 'https://wwsc-info-97af28.netlify.live/webhooks/zettle',
  contactEmail: 'andystevenson@mac.com',
}

export async function update(options = defaultUpdate) {
  const url = `${env.pusher}/organizations/self/subscriptions/${uuid}`

  const body = JSON.stringify(options)

  try {
    await init()

    const response = await fetch(url, { method: 'PUT', headers, body })
    if (response.ok) {
      writeFileSync(updateFile, body)
      return true
    }

    throw Error(
      `zettle webhook update response failed [${response.status}][${response.statusText}]`,
    )
  } catch (error) {
    console.error(`zettle webhook update failed [${error.message}]`)
    throw error
  }
}

export async function unsubscribe() {
  const url = `${env.pusher}/organizations/self/subscriptions/${uuid}`

  try {
    await init()

    const response = await fetch(url, { method: 'DELETE', headers })
    if (response.ok) {
      writeFileSync(unsubscribeFile, JSON.stringify({ uuid }))
      return true
    }

    throw Error(
      `zettle webhook unsubscribe response failed [${response.status}][${response.statusText}]`,
    )
  } catch (error) {
    console.error(`zettle webhook unsubscribe failed [${error.message}]`)
    throw error
  }
}

export async function list() {
  await init()

  const url = `${env.pusher}/organizations/self/subscriptions`
  try {
    const response = await fetch(url, { headers })
    if (response.ok) {
      const json = await response.json()
      writeFileSync(subscriptionListFile, JSON.stringify(json))
      return json
    }
    throw Error(
      `zettle webhook list response failed [${response.status}][${response.statusText}]`,
    )
  } catch (error) {
    console.error(`zettle webhook list failed [${error.message}]`)
    throw error
  }
}

export async function self() {
  await init()

  const url = env.self
  try {
    const response = await fetch(url, { headers })
    if (response.ok) {
      const json = await response.json()
      writeFileSync(selfFile, JSON.stringify(json))
      return json
    }
    throw Error(
      `zettle webhook self response failed [${response.status}][${response.statusText}]`,
    )
  } catch (error) {
    console.error(`zettle webhook self failed [${error.message}]`)
    throw error
  }
}

export default {
  subscribe,
  update,
  unsubscribe,
  list,
  self,
  defaultSubscription,
  defaultUpdate,
}
