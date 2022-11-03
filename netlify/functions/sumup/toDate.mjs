import dayjs from 'dayjs'

export const toDate = (string) => {
  const [date, time] = string.split(' ')
  const [year, month, day] = date.split('-')
  const [hour, minute, second] = time.split(':')

  const calendar = dayjs()
    .year(year)
    .month(month - 1)
    .date(day)
  const datetime = calendar.hour(hour).minute(minute).second(second)
  return datetime
}

export default toDate
