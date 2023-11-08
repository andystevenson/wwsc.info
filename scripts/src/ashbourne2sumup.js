const { log } = require('@andystevenson/lib/logger')

const isMember = require('./memberStatus.js')
const toAddress = require('./transformAshbourneAddress')
const toCity = require('./ashbourneAddressToCity')
const toCounty = require('./ashbourneAddressToCounty')
const toDate = require('./ashbourneDate2sumupDate')
const toGender = require('./ashbourneTitle2gender')

const mapper = {
  customer_group_id(source) {
    // if Live etc
    return isMember(source)
      ? '5cfb66a0-8a47-4ead-a188-21e5d7acd247' // MEMBERS customer group
      : '51365c0e-ca32-45f5-bf83-99d22f1dab1b' // NON-MEMBERS customer group
  },
  name(source) {
    const status = isMember(source) ? ' (member)' : ' (non-member)'
    const name = `${source[
      'First Name'
    ].trim()} ${source.Surname.trim()}${status}`
    return name.trim()
  },
  address(source) {
    return toAddress(source.Address)
  },
  city(source) {
    return toCity(toAddress(source.Address))
  },
  county(source) {
    return toCounty(toAddress(source.Address))
  },
  postcode(source) {
    return source.Postcode
  },
  mobile(source) {
    return source.Mobile.trim().replace(/\s/, '')
  },
  email(source) {
    return source.Email.trim().replace(/\s/, '')
  },
  opt_in_email() {
    return 1
  },
  account_code(source) {
    return source['Card No'].trim().replace(/\s/, '')
  },
  is_account_customer(source) {
    return isMember(source) ? 1 : 0
  },
  website() {
    return 'https://westwarwicks.club'
  },
  extra_notes(source) {
    return JSON.stringify({
      ID: source.ID,
      KnownAs: source.KnownAs,
      'Club Info': source['Club Info'],
      'Period Payment': source['Period Payment'],
      'Joined date': source['Joined date'],
      'Review date': source['Review date'],
      'Payment Number': source['Payment Number'],
      'Payment Month': source['Payment Month'],
      'Payment Year': source['Payment Year'],
      'Payment Date': source['Payment Date'],
      LastVisit: source.LastVisit,
      FacilityNo: source.FacilityNo,
    })
  },
  membership_no(source) {
    return source['Member No'].trim().replace(/\s/, '')
  },
  title(source) {
    return source.MemTitle.trim().replace(/\s/, '')
  },
  first_name(source) {
    return source['First Name'].trim()
  },
  last_name(source) {
    return source.Surname.trim()
  },
  company_name() {
    return 'WWSC'
  },
  source() {
    return 'ashbourne'
  },
  membership_expiry_date(source) {
    return toDate(source['Expire Date'])
  },
  date_of_birth(source) {
    return toDate(source.DOB)
  },
  gender(source) {
    return toGender(source.MemTitle)
  },
  custom_field_1(source) {
    return source.AshRef
  },
  custom_field_2(source) {
    return source.Status
  },
  custom_field_3(source) {
    return source['Mem Type']
  },
  custom_field_4(source) {
    return source['Last Pay Date']
  },
  active(source) {
    // show on tills.... for now at least
    return 1
  },
}

const transforms = Object.entries(mapper)

const member2sumup = (member) =>
  transforms.reduce((customer, [key, transform]) => {
    let transformed = transform(member)
    if (transformed === '') transformed = null
    customer[key] = transformed
    return customer
  }, {})

module.exports = member2sumup
