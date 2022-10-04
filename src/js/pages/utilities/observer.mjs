export default function observe(resources = []) {
  const targets = resources.reduce((list, target) => {
    const today = document.getElementById(`${target}:today`)
    const mtd = document.getElementById(`${target}:mtd`)
    const ytd = document.getElementById(`${target}:ytd`)
    list.push(today, mtd, ytd)
    return list
  }, [])

  const config = { attributes: true, childList: true, subtree: true }

  const watch = (list, observer) => {
    update(targets)
  }

  observer = new MutationObserver(watch)

  targets.forEach((target) => observer.observe(target, config))
}

let observer = null

const gbp = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'GBP',
})

const today = document.getElementById('wwsc:today')
const mtd = document.getElementById('wwsc:mtd')
const ytd = document.getElementById('wwsc:ytd')

function update(targets) {
  const values = {
    today: 0,
    mtd: 0,
    ytd: 0,
  }

  for (const target of targets) {
    const { id, textContent } = target
    const property = id.split(':')[1]
    const value = +textContent.replace(/[£,]/g, '')
    values[property] += value
  }

  today.textContent = gbp.format(values.today)
  mtd.textContent = gbp.format(values.mtd)
  ytd.textContent = gbp.format(values.ytd)
}
