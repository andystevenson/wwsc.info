// updated to drive new node version for lambda functions

import fetch from 'node-fetch'
import { inspect } from 'node:util'

const apiKey = process.env.GETADDRESS_API_KEY
const method = 'POST'
const headers = { 'content-type': 'application/json' }
const top = 20
const all = true

// call appropriate api based on action param
async function get(id) {
  const getApi = `https://api.getAddress.io/get/${id}?api-key=${apiKey}`
  return fetch(getApi)
}

async function find(postcode, format, sort, expand, fuzzy) {
  let findApi = `https://api.getAddress.io/find/${postcode}?api-key=${apiKey}`
  if (sort) findApi += '&sort=true'
  if (fuzzy) findApi += '&fuzzy=true'
  if (format) findApi += '&format=true'
  if (expand) findApi += '&expand=true'

  // console.log({ findApi })
  // NOTE: format & expand together is ignored and just the first is taken
  return fetch(findApi)
}

async function autocomplete(term, filter, location) {
  const autocompleteApi = `https://api.getAddress.io/autocomplete/${term}?top=20&all=true&api-key=${apiKey}`

  if (filter || location) {
    return fetch(autocompleteApi, {
      method,
      headers,
      body: JSON.stringify({ top, all, filter, location }),
    })
  }
  return fetch(autocompleteApi)
}

// NOTE: search can be
// "search":["postcode", "locality", "town_or_city", "district", "county", "country"]

async function typeahead(term, search, filter) {
  const typeaheadApi = `https://api.getAddress.io/typeahead/${term}?top=20&api-key=${apiKey}`

  if (search || filter) {
    return fetch(typeaheadApi, {
      method,
      headers,
      body: JSON.stringify({ top, search, filter }),
    })
  }
  return fetch(typeaheadApi)
}

async function distance(from, to) {
  const distanceApi = `https://api.getAddress.io/distance/${from}/${to}?${apiKey}`
  return fetch(distanceApi)
}

// handler, selects action and dispatches with appropriate parameters

export const handler = async (event) => {
  if (!apiKey) return { statusCode: 500, body: `getaddress.io api key not set` }

  // console.log('event = ', inspect(event, { depth: null, colors: true }))
  const params = event.queryStringParameters
  const { action } = params
  const { id, postcode, term, from, to, format, sort, expand, fuzzy } = params

  const body = event.body ? JSON.parse(event.body) : {}
  const { search, filter, location } = body

  let response = null
  try {
    switch (action) {
      case 'get':
        response = await get(id)
        break
      case 'find':
        response = await find(postcode, format, sort, expand, fuzzy)
        break
      case 'autocomplete':
        response = await autocomplete(term, filter, location)
        break
      case 'typeahead':
        response = await typeahead(term, search, filter)
        break
      case 'distance':
        response = await distance(from, to)
    }

    if (response?.ok) {
      const json = await response.json()
      return { statusCode: 200, body: JSON.stringify(json) }
    }

    // no response received, either api failed or more general failure
    const statusCode = response ? response.status : 500
    const statusText = response ? response.statusText : 'serverless fail'
    const body = `getaddress error ${statusText}`
    return { statusCode, body }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}
