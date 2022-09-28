import sumup from '../../../.cache/sumup/sumup-check-find.json' assert { type: 'json' }

export default (request) => {
  const url = new URL(request.url)
  let search = url.searchParams.get('search')
  if (!search) return

  let active = url.searchParams.get('active')
  active = active === 'true'

  let ascending = url.searchParams.get('ascending')
  ascending = ascending === 'true' ? 1 : -1

  search = +search.replaceAll(/\s+/g, ' ')

  let matches = Object.values(sumup)
    .filter((member) => member[0] === active)
    .filter((member) => {
      const { length } = member
      const age = member[length - 1]
      const passes = age > search
      return passes
    })
    .sort((a, b) => {
      const { length } = a
      const last = length - 1
      const aAge = a[last]
      const bAge = b[last]
      return (aAge - bAge) * ascending
    })
    .map((member) => {
      const [value, card, fullname, status, email, age] = member
      const template = `<li ${value}><p>${card}</p><p>${fullname}</p><a href="mailto:${email}"><p>${email}</p></a><p>${status}</p><p>${age}</p></li>`
      return template
    })
    .join('\n')

  matches = `<li true><p>card</p><p>name</p><p>email</p></a><p>status</p><p>age</p></li>\n${matches}`

  return new Response(matches)
}
