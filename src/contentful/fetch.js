const env = require('./env')

// api endpoint is for grpahql interface only
// from can be 'delivery' or 'preview'

const contentfulFetch = async (query, from = 'delivery') => {
  // node-fetch is ESM only now so have to do this!!!
  if (!query) throw TypeError(`contentful fetch query cannot be empty`)

  const fetch = (await import('node-fetch')).default

  const response = await fetch(env.api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.token[from]}`,
    },
    body: JSON.stringify({ query }),
  })

  const json = await response.json()
  const content = json.data
  return content
}

module.exports = contentfulFetch
