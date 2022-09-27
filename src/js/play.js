// just trying things out
const _ = require('lodash')

const array = [
  { tag: 'a', price: '£1' },
  { price: '-£1' },
  { price: '£8' },
  { price: '£1.081' },
  { tag: 'b', price: '£6' },
  { price: '£1.11' },
  { price: '-£0.999' },
  { tag: 'b', price: '£3' },
  { price: '£9' },
  { names: ['a', 'b', 'c'], price: '£2' },
]

const sorted = _.sortBy(array, [(e) => +e.price.replace('£', '')])
console.log(sorted)

let as = _.filter(array, ['tag', 'b'])
console.log({ as })

as = _.filter(array, ['names', ['a', 'b', 'c']])
console.log({ as })

as = _.filter(array, ['names', _.includes('b', 'c')])
console.log({ as })
