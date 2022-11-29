import debounce from 'lodash.debounce'

const input = document.querySelector('input[type="text"]')
const active = document.querySelector('input[name="active"]')
const placeholder = document.querySelector('.placeholder')

const send = debounce(async (e) => {
  e.preventDefault()
  const value = input.value.trim()

  if (!value) return (placeholder.innerHTML = '')

  const params = new URLSearchParams()
  params.append('search', value)
  params.append('active', active.checked)

  const uri = `${location.href.replace(/#+\w*/g, '')}?${params}`
  let html = await fetch(uri)
  html = await html.text()
  placeholder.innerHTML = html
}, 300)

input?.addEventListener('input', send)
active?.addEventListener('change', send)
