import sumup from '../../../.cache/sumup/sumup-check-find.json' assert { type: 'json' }

export default (request, { log }) => {
  const url = new URL(request.url)
  let search = url.searchParams.get('search')
  if (!search) return

  search = search.trim().toLowerCase()
  search = search.replaceAll(/\s+/g, ' ')

  const matches = Object.entries(sumup)
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

  return new Response(matches)
}
