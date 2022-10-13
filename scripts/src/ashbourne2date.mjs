import date from 'dayjs'
export default (string) => {
  const dateString = string.trim().split(/\s+/)[0]
  const [day, month, year] = dateString.split('/')
  const result = date()
    .year(+year)
    .month(+month - 1)
    .date(day)
    .startOf('day')

  return result
}
