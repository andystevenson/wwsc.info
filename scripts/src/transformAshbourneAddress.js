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

// console.log(transform('10 Broad Oaks Road#Solihull###'))
// console.log(transform('Cricket Pro#############################'))
// console.log(transform('116 HEATHER ROAD#SMALL HEATH#Birmingham#Warwickshire#'))
// console.log(transform('Flat 21 consort house'))
// console.log(transform('17 WELLINGTON DRIVE#SOLIHULL##########################'))
// console.log(transform('1 Bakehouse Lane#Chadwick End #Solihull#West Midlands#'))
// console.log(
//   transform(
//     'BRODENE  FORSHAW HEATH ROAD#EARSWOOD  SOLIHULL#WEST MIDLANDS########################################',
//   ),
// )
// console.log(
//   transform(
//     '68 Dorchester Road#Solihull#West Midlands##DD Paid by Iain Stokes###################################',
//   ),
// )
