const { lt } = require('lodash')

const male = ['mr', 'master', 'mast']
const female = ['miss', 'ms', 'mrs']

const isMale = (title) => male.includes(title.trim().toLowerCase())
const isFemale = (title) => female.includes(title.trim().toLowerCase())

module.exports = (title) => {
  if (isMale(title)) return 'male'
  if (isFemale(title)) return 'female'
  return 'unknown'
}

module.exports.isMale = isMale
module.exports.isFemale = isFemale
