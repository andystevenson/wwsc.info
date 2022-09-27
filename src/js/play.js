// just trying things out
const _ = require('lodash')

const array = [
  { price: '£1' },
  { price: '-£1' },
  { price: '£8' },
  { price: '£1.081' },
  { price: '£6' },
  { price: '£1.11' },
  { price: '-£0.999' },
  { price: '£3' },
  { price: '£9' },
  { price: '£2' },
]

const sorted = _.sortBy(array, [(e) => +e.price.replace('£', '')])
console.log(sorted)
