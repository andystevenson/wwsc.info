import sumup from '../../../.cache/sumup/sumup-check-find.json' assert { type: 'json' }

export default (request) => {
  const url = new URL(request.url)
  let search = url.searchParams.get('search')
  if (!search) return

  search = search.trim().toLowerCase()
  search = search.replaceAll(/\s+/g, ' ')

  let active = url.searchParams.get('active')
  active = active === 'true'

  let matches = Object.entries(sumup)
    .filter(([, member]) => member[0] === active)
    .filter(([, member]) => {
      const [, , fullname] = member
      const passes = fullname.toLowerCase().includes(search)
      return passes
    })
    .map(([membership, member]) => {
      const [value, card, fullname, status, email, age] = member
      const template = `<li ${value}><p>${card}</p><p>${fullname}</p><a href="mailto:${email}"><p>${email}</p></a><p>${status}</p><p>${membership}</p><p>${age}</p></li>`
      return template
    })
    .join('\n')

  matches = `<li ${true}><p>card no</p><p>name</p><p>email</p></a><p>status</p><p>mem id</p><p>age</p></li>\n${matches}`

  return new Response(matches)
}
