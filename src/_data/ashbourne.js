const data = require('../../.cache/ashbourne/ashbourne.json')
const isMember = require('../../scripts/src/memberStatus.js')

module.exports = {
  count: data.length,

  members: data.reduce(
    (count, member) => (isMember(member) ? (count = count + 1) : count),
    0,
  ),
}
