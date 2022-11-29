const { capitalize } = require('lodash')

const transform = (address) => {
  if (address === '') return null
  let newAddress = address.trim()
  newAddress = newAddress.replace(/#+$/, '') // trim ending ######
  newAddress = newAddress.trimEnd()
  newAddress = newAddress.replaceAll(/#+/g, ', ')
  newAddress = newAddress.replaceAll(/\s+,\s+/g, ', ')
  newAddress = newAddress
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
  newAddress = newAddress.replaceAll(/\s{2,}/g, ' ')
  return newAddress
}

module.exports = transform
