export const statuses = [
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

export const memberStatuses = [
  'live',
  'dd hold',
  'dd presale',
  'defaulter',
  'paid in full',
  'freeze',
]

export const nonMemberStatuses = ['final', 'complete', 'expired', 'prospects']

export const isMember = (status) =>
  memberStatuses.includes(status.trim().toLowerCase())

export const isNonMember = (status) =>
  nonMemberStatuses.includes(status.trim().toLowerCase())

export const isSocial = (memType) => {
  return memType.trim().toLowerCase() === 'adult social membership'
}

export const fullName = (member) => {
  const { 'First Name': firstName, Surname: surname } = member
  return `${firstName.trim()} ${surname.trim()}`
}

export default {
  statuses,
  memberStatuses,
  nonMemberStatuses,
  isMember,
  isNonMember,
  isSocial,
  fullName,
}
