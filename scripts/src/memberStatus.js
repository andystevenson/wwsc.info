const statuses = [
  'live',
  'dd hold',
  'dd presale',
  'defaulter',
  'final',
  'paid in full',
  'complete',
  'freeze',
  'expired',
  'prospects',
]

const memberStatuses = [
  'live',
  'dd hold',
  'dd presale',
  'defaulter',
  'paid in full',
  'freeze',
]

const nonMemberStatuses = ['final', 'complete', 'expired', 'prospects']

const isMember = (status) =>
  memberStatuses.includes(status.trim().toLowerCase())

const isNonMember = (status) =>
  nonMemberStatuses.includes(status.trim().toLowerCase())

module.exports = {
  statuses,
  memberStatuses,
  nonMemberStatuses,
  isMember,
  isNonMember,
}
