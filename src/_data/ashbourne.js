const data = require('../../.cache/ashbourne/ashbourne.json')
const { isMember } = require('../../scripts/src/memberStatus')

module.exports = {
  count: data.length,

  members: data.reduce(
    (count, member) => (isMember(member.Status) ? (count = count + 1) : count),
    0,
  ),
}
