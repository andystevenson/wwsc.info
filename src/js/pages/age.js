import { debounce } from 'lodash'

console.log('finder...')

const input = {
  search: document.getElementById('search'),
  active: document.getElementById('active'),
  ascending: document.getElementById('ascending'),
}

const placeholder = document.querySelector('.placeholder')

const send = debounce(async (e) => {
  e.preventDefault()
  const search = input.search?.value.trim()
  if (!search) return (placeholder.innerHTML = '')

  const active = input.active?.checked
  const ascending = input.ascending?.checked

  const params = new URLSearchParams({ search, active, ascending })
  const uri = `/api/age?${params}`
  console.log({ uri }, active.checked)
  let html = await fetch(uri)
  html = await html.text()
  placeholder.innerHTML = html
}, 300)

input.search?.addEventListener('input', send)
input.active?.addEventListener('change', send)
input.ascending?.addEventListener('change', send)
