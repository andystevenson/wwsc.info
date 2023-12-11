import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

export const tz = 'Europe/London'
export const todayUK = dayjs().tz(tz).startOf('day')
export const today = dayjs().utc().startOf('day')
export const year = today.year()

export const date = dayjs

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
  return a.valueOf() - b.valueOf()
}

export const sortDescending = (a, b) => {
  return b.valueOf() - a.valueOf()
}

export const nextDay = (dayOfWeek, start = today) => {
  let day = start.startOf('day')
  while (day.day() !== dayOfWeek) day = day.add(1, 'day')
  return day
}

export const DaysOfWeek = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const nextDayOfWeek = (day, start = today) =>
  nextDay(
    DaysOfWeek.findIndex((weekday) => day.toLowerCase() === weekday),
    start,
  )

export const nextSunday = (start = today) => nextDay(0, start)
export const nextMonday = (start = today) => nextDay(1, start)
export const nextTuesday = (start = today) => nextDay(2, start)
export const nextWednesday = (start = today) => nextDay(3, start)
export const nextThursday = (start = today) => nextDay(4, start)
export const nextFriday = (start = today) => nextDay(5, start)
export const nextSaturday = (start = today) => nextDay(6, start)

// utilities
export const ordinalDate = (date) => date.format('dddd, Do MMMM, YYYY')
export const ordinalDateTime = (date) =>
  date.format('dddd, Do MMMM, YYYY HH:mm:ss')

export const nearestDay = (...days) => {
  const nextDays = days
    .map((day) => nextDay(day))
    .sort((a, b) => {
      if (a.isBefore(b, 'day')) return -1
      if (a.isAfter(b, 'day')) return 1
      return 0
    })
  return nextDays
}

export const nearestDayOfWeek = (...days) => {
  const nextDaysOfWeek = days
    .map((day) => nextDayOfWeek(day))
    .sort((a, b) => {
      if (a.isBefore(b, 'day')) return -1
      if (a.isAfter(b, 'day')) return 1
      return 0
    })
  return nextDaysOfWeek
}

export const ascending = (a, b) => {
  if (a.isBefore(b, 'day')) return -1
  if (a.isAfter(b, 'day')) return 1
  return 0
}

export const descending = (a, b) => {
  if (a.isBefore(b, 'day')) return 1
  if (a.isAfter(b, 'day')) return -1
  return 0
}

export const dateRange = (range) => {
  let from = date()
  let to = date()

  switch (range) {
    case 'today':
      from = from.startOf('day')
      break

    case 'yesterday':
      from = from.startOf('day').subtract(1, 'day')
      to = from.add(1, 'day')
      break

    case 'week':
      // dayjs treats 'Sunday' as start of the week!
      from = from.startOf('week').add(1, 'day')
      break

    case 'month':
      from = from.startOf('month')
      break

    case 'year':
      from = from.startOf('year')
      break

    case 'financial-year':
      from = lastOctoberUK
      break

    default:
      return dateRange('yesterday')
  }

  return { from, to }
}
