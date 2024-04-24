// updated to drive new node version for lambda functions

import social from '../../../.cache/ashbourne/new-social-members.json' assert { type: 'json' }
export const handler = async (event) => {
  const { members } = event.queryStringParameters
  if (!members)
    return {
      statusCode: 400,
      body: 'new-social-members requires members parameter',
    }

  let matches = social
    .map((member) => {
      const { name, joined, age } = member
      return `<li true><p>${name}</p><p>${joined}</p><p>${age}</p></li>`
    })
    .join('\n')
  matches = `<li true><p>name</p><p>joined</p><p>age</p></li>\n${matches}`

  return { statusCode: 200, body: matches }
}
