import { debounce } from 'lodash'

console.log('card finder')

const input = document.querySelector('input')
const placeholder = document.querySelector('.placeholder')

const send = debounce(async (e) => {
  e.preventDefault()
  const value = e.target?.value.trim()

  if (!value) return (placeholder.innerHTML = '')

  const params = new URLSearchParams()
  params.append('search', value)
  console.log(`[${value}][${params}]`)
  const uri = `${location.href}?${params}`
  let html = await fetch(uri)
  html = await html.text()
  placeholder.innerHTML = html
}, 300)

input?.addEventListener('input', send)
