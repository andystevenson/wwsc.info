require('dotenv').config()
const { exit } = require('node:process')
const { inspect } = require('node:util')
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)

const customers = {
  stripe: require('../.cache/stripe/customers.json'),
  sumup: require('../.cache/sumup/sumup-customers-updated.json'),
}

const uniqueEmail = () => {
  const unique = {}
  const subscribed = true
  const vars = { validated: null }

  customers.stripe.forEach((customer) => {
    const { email: address, name } = customer
    unique[address] ||= { address, name, subscribed, vars }
  })

  customers.sumup.forEach((customer) => {
    if (customer.customer_group === 'MEMBERS' && customer.email) {
      const { email: address, name } = customer
      unique[address] ||= { address, name, subscribed, vars }
    }
  })

  log({ unique })
  log(Object.keys(unique).length)
}

const DOMAIN = 'email.westwarwicks.club'

const log = (object) =>
  console.log(inspect(object, { depth: null, colors: true }))

log(process.cwd())
log(customers.sumup.length)
log(customers.stripe.length)

const apiKey = process.env.MAILGUN_API_KEY
if (!apiKey) {
  console.error('mailgun api key not set')
  exit(1)
}

const client = mailgun.client({
  username: 'api',
  key: apiKey,
  url: 'https://api.eu.mailgun.net',
})

// match_recipient("(?P<user>.*?)@(?P<domain>.*)")
// forward("http://mycallback.com/domains/\g<domain>/users/\g<user>")

const createRoutes = async () => {
  try {
    const createdRoute = await client.routes.create({
      expression:
        'match_recipient("(?P<user>sarah|andy?)@email.westwarwicks.club")',
      action: ['forward("\\g<user>@westwarwicks.co.uk")', 'stop()'],
      description: 'WWSC redirect',
    })
    console.log('createdRoute', createdRoute)
  } catch (error) {
    console.error('ERROR', error)
  }
}

const listRoutes = async () => {
  const routes = await client.routes.list()
  log({ routes })
  return routes
}

const credentials = async () => {
  try {
    const domainCredentials = await client.domains.domainCredentials.list(
      DOMAIN,
    )
    log({ domainCredentials })
  } catch (error) {
    console.error(error)
  }
}

const domains = async () => {
  try {
    const ds = await client.domains.list()
    console.log({ ds })
  } catch (error) {
    console.error(error)
  }
}

const smtpCreateCredentials = async () => {
  try {
    const createdCredentials = await client.domains.domainCredentials.create(
      DOMAIN,
      {
        login: 'sarah@email.westwarwicks.club',
        password: 'wwsc-sarah',
      },
    )
    log({ createdCredentials })
  } catch (error) {
    console.error(error)
  }
}

const send = async (message) => {
  const response = await client.messages.create(DOMAIN, message)
  log({ response })
  return response
}

async function createMailingList(options) {
  try {
    const mailingList = await client.lists.create(options)
    console.log({ mailingList })
  } catch (error) {
    console.error(error)
  }
}

const reply = {
  address: `reply@${DOMAIN}`,
  name: 'reply',
  description: 'WWSC members reply email list',
  access_level: 'members',
}

const noReply = {
  address: `noreply@${DOMAIN}`,
  name: 'noreply',
  description: 'WWSC members no-reply email list',
  access_level: 'readonly',
}

const members = {
  address: `members@${DOMAIN}`,
  name: 'members',
  description: 'WWSC members no-reply email list',
  access_level: 'readonly',
}

const defaultLists = [members, noReply, reply]

async function createMailingLists(lists = defaultLists) {
  try {
    for await (let list of lists) {
      list = await client.lists.create(list)
      log({ list })
    }
  } catch (error) {
    console.error(error)
  }
}

async function mailingListMembers(list = `testlist@${DOMAIN}`) {
  try {
    let members = await client.lists.members.listMembers(list, {
      limit: 2,
    })
    console.log('first', members.items)
    members = await client.lists.members.listMembers(list, {
      page: members.pages.next.page,
    })
    console.log('second', members.items)
    members = await client.lists.members.listMembers(list, {
      page: members.pages.next.page,
    })
    console.log('third', members.items)
  } catch (error) {
    console.error(error)
  }
}

async function run() {
  // await createRoutes()
  // await listRoutes()
  // await uniqueEmail()
  await mailingListMembers()
}

run()
