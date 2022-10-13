console.log('new social members')

const count = document.getElementById('count')
const year = document.getElementById('year')
const placeholder = document.getElementById('placeholder')

async function newMembers() {
  console.log('newMembers')
  const params = new URLSearchParams({ members: 'all' })
  const uri = `${location.href.replace(/#+\w*/g, '')}?${params}`
  console.log({ uri })
  let html = await fetch(uri)
  html = await html.text()
  placeholder.innerHTML = html
  count.textContent = placeholder.children?.length ?? 0
  year.textContent = new Date().getFullYear()
}

window.addEventListener('load', () =>
  setTimeout(async () => {
    await newMembers()
  }, 1000),
)
