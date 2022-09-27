import { debounce } from 'lodash'

console.log('finder...')

const input = document.querySelector('input[type="number"]')
const active = document.querySelector('input[name="active"]')
const ascending = document.querySelector('input[name="ascending"]')
const placeholder = document.querySelector('.placeholder')

const send = debounce(async (e) => {
  e.preventDefault()
  const value = e.target?.value.trim()

  if (!value) return (placeholder.innerHTML = '')

  const params = new URLSearchParams()
  params.append('search', value)
  params.append('active', active.checked)
  params.append('ascending', ascending.checked)
  const uri = `${location.href.replace(/#+\w*/g, '')}?${params}`
  console.log({ uri }, active.checked)
  let html = await fetch(uri)
  html = await html.text()
  placeholder.innerHTML = html
}, 300)

input?.addEventListener('input', send)
