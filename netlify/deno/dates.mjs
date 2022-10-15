import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

export const date = dayjs
date.extend(utc)
date.extend(timezone)
date.tz.setDefault('Europe/London')

export const today = date().startOf('day')

console.log(today, date.tz.guess())
export const dateFormat = 'YYYY-MM-DD'

export const lastOctober = (from = date()) => {
  const month = from.month()

  const octoberMonth = 9
  if (month === octoberMonth) {
    const oct1 = from.startOf('month').startOf('day')
    console.log('new oct', oct1.format(), oct1.unix())
    return oct1
  }

  const diff = octoberMonth - month

  if (diff < 0) {
    const october1st = from.startOf('month').add(diff, 'months').startOf('day')
    return october1st
  }

  const october1st = from
    .startOf('month')
    .add(diff - 12, 'months')
    .startOf('day')
  return october1st
}

export const sortAscending = (a, b) => {
  const aDate = date(a.timestamp)
  const bDate = date(b.timestamp)
  if (aDate.isBefore(bDate)) return -1
  if (aDate.isAfter(bDate)) return 1
  return 0
}

export const sortDescending = (a, b) => {
  const aDate = date(a.timestamp)
  const bDate = date(b.timestamp)
  if (aDate.isBefore(bDate)) return 1
  if (aDate.isAfter(bDate)) return -1
  return 0
}

export default {
  date,
  dateFormat,
  lastOctober,
  sortAscending,
  sortDescending,
}
