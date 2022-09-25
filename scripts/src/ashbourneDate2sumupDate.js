module.exports = (date) => {
  if (!date) return ''
  const newDate = date.split(' ')[0]
  const [day, month, year] = newDate.split('/')
  return `${year}-${month}-${day}`
}
