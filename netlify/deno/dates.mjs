import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export const date = dayjs

export const tz = 'Europe/London'
export const todayUK = dayjs().tz(tz).startOf('day')
export const today = dayjs().utc().startOf('day')
export const year = today.year()

export const lastOctoberUK =
  todayUK.month() >= 9
    ? todayUK.month(9).date(1)
    : todayUK
        .year(year - 1)
        .month(9)
        .date(1)

export const lastOctober =
  today.month() >= 9
    ? today.month(9).date(1)
    : today
        .year(year - 1)
        .month(9)
        .date(1)

export const sortAscending = (a, b) => {
  return a.timestamp - b.timestamp
}

export const sortDescending = (a, b) => {
  return b.timestamp - a.timestamp
}

export const dateFormat = 'YYYY-MM-DD'

export default {
  date,
  dateFormat,
  today,
  todayUK,
  lastOctober,
  lastOctoberUK,
  sortAscending,
  sortDescending,
}
