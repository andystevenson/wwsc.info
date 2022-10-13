import social from '../../../.cache/ashbourne/new-social-members.json' assert { type: 'json' }
export default (request) => {
  const url = new URL(request.url)
  const members = url.searchParams.get('members')
  if (!members) return

  let matches = social
    .map((member) => {
      const { name, joined, age } = member
      return `<li true><p>${name}</p><p>${joined}</p><p>${age}</p></li>`
    })
    .join('\n')
  matches = `<li true><p>name</p><p>joined</p><p>age</p></li>\n${matches}`

  return new Response(matches)
}
