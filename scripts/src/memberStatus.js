const dayjs = require('dayjs')
const today = dayjs()

const isMember = (member) => {
  const status = member.Status.toLowerCase().trim()
  if (status === 'live') return true

  const card = member['Card No']
  if (status === 'paid in full' && card) return true

  if (status === 'complete') {
    const ashref = member.AshRef
    let lastPayDate = member['Last Pay Date'].trim().split(' ')[0]
    let [day, month, year] = lastPayDate.split('/')
    const dLastPayDate = dayjs({ year: +year, month: +month - 1, day: +day })
    const aMonthAgo = today.subtract(1, 'month')
    if (card && ashref && dLastPayDate.isAfter(aMonthAgo, 'day')) {
      return true
    }
  }
  return false
}

module.exports = isMember
