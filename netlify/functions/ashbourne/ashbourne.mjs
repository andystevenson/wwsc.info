// updated to drive new node version for lambda functions
import ashbourne from '../../../.cache/ashbourne/ashbourne.json'
import { date } from '../../deno/dates.mjs'
import gbp from '../../deno/gbp.mjs'
import { isMember } from '../../../scripts/src/memberStatus.mjs'

const isMonthly = (type) => {
  const tType = type.trim().toLowerCase()
  return tType.endsWith('dd') || tType === 'concession membership'
}

const ashbourne2date = (aDate) => {
  const elements = aDate.replace(/\s.*/, '').split('/')
  return date()
    .year(+elements[2])
    .month(+elements[1] - 1)
    .date(elements[0])
    .startOf('day')
}

const members = ashbourne.filter((member) => member && isMember(member.Status))

const ashref = members
  .filter((member) => member.AshRef !== '')
  .map((member) => ({
    no: member['Member No'],
    ashref: member.AshRef,
    lpd: member['Last Pay Date'],
    last: ashbourne2date(member['Last Pay Date']),
    date: ashbourne2date(member['Last Pay Date']).date(),
    pp: +member['Period Payment'],
    type: member['Mem Type'],
  }))
  .filter((member) => isMonthly(member.type))

const sumToday = (ashref) => {
  const today = date().date()

  return ashref.reduce((total, member) => {
    const { date, pp } = member
    if (date === today) total = total + pp
    return total
  }, 0)
}

const sumMonthToDate = (ashref) => {
  const today = date().date()

  return ashref.reduce((total, member) => {
    const { date, pp } = member
    if (date <= today) total = total + pp
    return total
  }, 0)
}

export const handler = async () => {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset="utf-8"' },
    body: JSON.stringify({
      today: gbp.format(sumToday(ashref)),
      mtd: gbp.format(sumMonthToDate(ashref)),
      ytd: gbp.format(sumMonthToDate(ashref)),
    }),
  }
}
