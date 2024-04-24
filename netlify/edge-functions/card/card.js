// updated to drive new node version for lambda functions

import ashbourne from '../../../.cache/sumup/sumup-check-card.json' assert { type: 'json' }

export default async (request, context) => {
  const members = ashbourne

  const url = new URL(request.url)
  let cardnumber = url.searchParams.get('cardnumber')
  if (!cardnumber) return

  cardnumber = +cardnumber.trim()

  const response = await context.next()
  let page = await response.text()
  const member = cardnumber in members ? members[cardnumber] : null

  const regex = /<section class="placeholder"><\/section>/

  if (!member) {
    // there is no such card
    const template = `
      <section class="invalid">
        <h2>Invalid Card</h2>
      </section>`
    page = page.replace(regex, template)
    return new Response(page, response)
  }

  // card existed at some point
  const [valid, fullname, status, email, age] = member
  const validity = valid ? 'valid' : 'invalid'
  const cardValidity = valid ? 'Card Valid' : 'Invalid Card'
  const template = `
    <section class="${validity}">
      <h2>${cardValidity}</h2>
      <strong>${fullname}</strong>
      <p>${status}</p>
      <p>${email}</p>
      <p><strong>Age:</strong><strong>${age}</strong></p>
    </section>`
  page = page.replace(regex, template)

  return new Response(page, response)
}
