const data = require('../../.cache/sumup/sumup-customers-updated.json')
const find = require('../../.cache/sumup/sumup-check-find.json')

const defaultAgeGroups = [
  [Number.MIN_SAFE_INTEGER, 6],
  [7, 11],
  [12, 17],
  [18, 25],
  [26, 64],
  [65, Number.MAX_SAFE_INTEGER],
]

const ageGroups = () => {
  const ages = defaultAgeGroups

  const result = ages.map(([from, to]) =>
    Object.values(find).reduce((count, member) => {
      const isMember = member[0]
      const age = member[member.length - 1]
      if (isMember && age >= from && age <= to) count = count + 1
      return count
    }, 0),
  )

  console.log({ result })
  return result
}

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

  male: data.reduce(
    (count, member) =>
      member.customer_group === 'MEMBERS' && member.gender === 'male'
        ? (count = count + 1)
        : count,
    0,
  ),
  female: data.reduce(
    (count, member) =>
      member.customer_group === 'MEMBERS' && member.gender === 'female'
        ? (count = count + 1)
        : count,
    0,
  ),
  unknown: data.reduce(
    (count, member) =>
      member.customer_group === 'MEMBERS' && member.gender === 'unknown'
        ? (count = count + 1)
        : count,
    0,
  ),
  ages: ageGroups(),
  ageGroups: defaultAgeGroups,
}
