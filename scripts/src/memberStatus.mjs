import dayjs from 'dayjs'
const today = dayjs()

export const isMember = (member) => {
  const status = member.Status && member.Status.toLowerCase().trim()
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

export const isNonMember = (member) => !isMember(member)

export const isSocial = (memType) => {
  return memType.trim().toLowerCase() === 'adult social membership'
}

export const fullName = (member) => {
  const { 'First Name': firstName, Surname: surname } = member
  return `${firstName.trim()} ${surname.trim()}`.trim()
}

export default {
  isMember,
  isNonMember,
  isSocial,
  fullName,
}
