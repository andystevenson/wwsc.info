const data = require('../../.cache/sumup/sumup-customers-updated.json')

module.exports = {
  count: data.length,
  active: data.reduce(
    (count, member) => (member.active ? (count = count + 1) : count),
    0,
  ),
  members: data.reduce(
    (count, member) =>
      member.customer_group === 'MEMBERS' ? (count = count + 1) : count,
    0,
  ),
}
