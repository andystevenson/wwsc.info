const { exit } = require('node:process')
const { inspect } = require('node:util')
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
require('dotenv').config()

const DOMAIN = 'email.westwarwicks.club'

const log = (object) =>
  console.log(inspect(object, { depth: null, colors: true }))

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
      console.log({ list })
    }
  } catch (error) {
    console.error(error)
  }
}

async function run() {
  await createRoutes()
  await listRoutes()
}

run()
