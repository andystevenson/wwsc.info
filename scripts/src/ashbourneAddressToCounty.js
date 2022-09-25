const city = require('./ashbourneAddressToCity')

const westMidlands = [
  'solihull',
  'birmingham',
  'coventry',
  'halesowen',
  'sutton coldfield',
  'moseley',
]
const worcestershire = ['malvern', 'redditch', 'stourport-on-severn']
const warwickshire = ['henley-in-arden', 'stratford-upon-avon', 'claverdon']

const transform = (address) => {
  if (/west midlands/i.test(address)) return 'West Midlands'
  if (/warwickshire/i.test(address)) return 'Warwickshire'
  if (/worcestershire/i.test(address)) return 'Worcestershire'

  const c = city(address).toLowerCase()
  if (westMidlands.includes(c)) return 'West Midlands'
  if (warwickshire.includes(c)) return 'Warwickshire'
  if (worcestershire.includes(c)) return 'Worcestershire'

  return 'West Midlands'
}

module.exports = transform
