import debounce from 'lodash.debounce'
import capitalize from 'lodash.capitalize'
import spinner from './utilities/spinner.mjs'

const gbp = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'GBP',
})

const hide = (el) => (el.style.display = 'none')

const form = document.getElementById('stripe-customer')
const errorDialog = document.getElementById('error-dialog')

const bodyParams = () => {
  const data = new FormData(form)
  const entries = Object.fromEntries(data.entries())
  const params = new URLSearchParams(entries)
  return params
}

const showError = (message) => {
  const dialogMessage = document.getElementById('error-dialog-message')
  dialogMessage.textContent = message
  errorDialog.showModal()
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  spinner.on()
  try {
    const response = await fetch('/api/invoice', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: bodyParams(),
    })

    let url = null
    if (response.ok) {
      const json = await response.json()
      if (json.object === 'checkout.session') {
        const session = json
        url = session.url
      }

      if (json.object === 'subscription') {
        const subscription = json
        const { latest_invoice } = subscription
        const { hosted_invoice_url } = latest_invoice
        url = hosted_invoice_url
      }

      // we have an invoice
      if (!url) {
        let { invoice } = json
        const { hosted_invoice_url } = invoice
        url = hosted_invoice_url
      }
      location.href = url
      return
    }
    // alert(await response.text())
    showError(await response.text())
  } catch (error) {
    console.error(error)
  }
  form.reset()
  spinner.off()
})

const address = document.getElementById('address')
const addressInputs = [...address.querySelectorAll('input')]
const postcode = addressInputs[0]
const postcodeAutocomplete = document.getElementById('postcode-autocomplete')
const postcodeAddresses = document.getElementById('postcode-addresses')
let addressList = []

const fillAddress = (selected) => {
  const { length } = addressInputs

  const town = addressInputs[length - 1]
  const street = addressInputs[length - 2]
  const line2 = addressInputs[length - 3]
  const line1 = addressInputs[length - 4]

  const {
    building_number,
    town_or_city,
    thoroughfare,
    formatted_address,
    city,
    line1: line_1,
    line2: line_2,
    postal_code,
  } = selected

  if (postal_code) postcode.value = postal_code

  town.value = town_or_city ?? city
  if (!town.value) town.value = ''

  street.value =
    selected.building_number && thoroughfare
      ? `${building_number} ${thoroughfare}`
      : thoroughfare
  if (!thoroughfare) street.value = line_2

  if (line_1) line1.value = line_1
  if (formatted_address && !formatted_address[0].includes(thoroughfare))
    line1.value = formatted_address[0]
  if (!line1.value) line1.value = ''
  if (formatted_address && !formatted_address[1].includes(thoroughfare))
    line2.value = formatted_address[1]
  if (!line1.value) line1.value = ''
}

const handleCustomer = async () => {
  const name = document.getElementById('name')
  const email = document.getElementById('email')
  const newOrExisting = document.getElementById('new-or-existing')
  const newElement = document.getElementById('new')
  const existing = document.getElementById('existing')
  const customerId = document.getElementById('customer-id')
  const sourceId = document.getElementById('source-id')

  const nameAutocomplete = document.getElementById('name-autocomplete')
  const emailAutocomplete = document.getElementById('email-autocomplete')
  let emails = []
  let names = []

  newOrExisting.addEventListener('change', (e) => {})

  const selectCustomer = (customer) => {
    name.value = customer.name
    email.value = customer.email
    customerId.value = customer.id
    sourceId.value = customer.default_source

    const { address } = customer
    if (address) fillAddress(address)
  }

  const hideCustomers = (id) => {
    id.innerHTML = ''
    id.style.display = 'none'
  }

  const displayCustomers = (customers, from, where) => {
    hideCustomers(where)
    const rect = from.getBoundingClientRect()
    where.style.display = 'block'
    where.style.left = `${rect.left}px`
    where.style.top = `${rect.bottom}px`

    const fragment = document.createDocumentFragment()
    const ul = document.createElement('ul')
    customers.forEach((customer, index) => {
      const li = document.createElement('li')
      const { name, email } = customer
      li.textContent = `${name}, ${email}`
      li.setAttribute('tabindex', 0)
      li.setAttribute('data-index', index)
      ul.appendChild(li)
    })
    fragment.appendChild(ul)
    where.appendChild(fragment)
  }

  const handleName = async (e) => {
    e.preventDefault()
    if (newElement.checked) return
    if (!name.value) return

    const displayName = (customers) => {
      hideCustomers(nameAutocomplete)
      if (customers.length === 0) return
      if (customers.length === 1) {
        selectCustomer(customers[0])
        return
      }

      displayCustomers(customers, name, nameAutocomplete)
    }

    spinner.on()
    const url = `/api/stripe-customers/?name=${name.value}`
    try {
      const response = await fetch(url, { method: 'POST' })
      if (response.ok) {
        const json = await response.json()
        names = json
        displayName(names, nameAutocomplete)
      }
    } catch (error) {
      console.error(`stripe-customers failed because [${error.message}]`)
    }
    spinner.off()
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    if (newElement.checked) return
    if (!email.value) return

    const displayEmail = (customers) => {
      hideCustomers(emailAutocomplete)
      if (customers.length === 0) return
      if (customers.length === 1) {
        selectCustomer(customers[0])
        return
      }

      displayCustomers(customers, email, emailAutocomplete)
    }

    spinner.on()
    const url = `/api/stripe-customers/?email=${email.value}`
    try {
      const response = await fetch(url, { method: 'POST' })
      if (response.ok) {
        const json = await response.json()
        emails = json
        displayEmail(emails, emailAutocomplete)
      }
    } catch (error) {
      console.error(`stripe-customers failed because [${error.message}]`)
    }
    spinner.off()
  }

  name.addEventListener('input', debounce(handleName, 300))
  email.addEventListener('input', debounce(handleEmail, 300))

  emailAutocomplete.addEventListener('click', (e) => {
    const li = e.target.closest('li')
    if (!li) return

    const index = li.dataset.index
    const selected = emails[index]
    selectCustomer(selected)
    hideCustomers(emailAutocomplete)
  })

  nameAutocomplete.addEventListener('click', (e) => {
    const li = e.target.closest('li')
    if (!li) return

    const index = li.dataset.index
    const selected = names[index]
    selectCustomer(selected)
    hideCustomers(nameAutocomplete)
  })

  emailAutocomplete.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      hideCustomers(emailAutocomplete)
      return
    }

    if (e.key === 'Enter') {
      const li = e.target.closest('li')
      if (!li) return
      selectCustomer(emails[li.dataset.index])
      hideCustomers(emailAutocomplete)
    }
  })

  nameAutocomplete.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      hideCustomers(nameAutocomplete)
      return
    }

    if (e.key === 'Enter') {
      const li = e.target.closest('li')
      if (!li) return
      selectCustomer(names[li.dataset.index])
      hideCustomers(nameAutocomplete)
    }
  })
}

const handlePreferences = () => {
  const preferences = document.getElementById('preferences')
  const inputs = [...preferences.querySelectorAll('input')]
  const all = inputs[0]

  const selected = {
    all() {
      const checked = all.checked
      inputs.forEach((input) => (input.checked = checked))
    },
    toggle() {
      if (all.checked) all.checked = false
    },
  }
  preferences.addEventListener('change', (e) => {
    if (e.target.id === 'all') return selected.all()
    selected.toggle()
  })
}

const handleDateOfBirth = () => {
  const dob = document.getElementById('dob')
  const now = new Date()
  dob.setAttribute(
    'max',
    `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
  )
}

const handleAddress = () => {
  const hideAddresses = () => {
    postcodeAddresses.style.display = 'none'
    postcodeAddresses.innerHTML = ''
  }

  const displayAddresses = (addresses) => {
    hideAddresses()
    const rect = postcode.getBoundingClientRect()

    postcodeAddresses.style.top = `${rect.bottom}px`
    postcodeAddresses.style.left = `${rect.left}px`
    postcodeAddresses.style.display = 'block'
    const fragment = document.createDocumentFragment()
    const ul = document.createElement('ul')
    addresses.forEach((address, index) => {
      const li = document.createElement('li')
      li.setAttribute('tabindex', 0)
      li.setAttribute('data-index', index)
      li.textContent = address
      ul.appendChild(li)
    })
    fragment.appendChild(ul)
    postcodeAddresses.appendChild(fragment)
  }

  const findAddresses = async () => {
    const params = new URLSearchParams({
      action: 'find',
      postcode: postcode.value,
      sort: true,
      expand: true,
    })

    spinner.on()
    const uri = `/api/getaddress?${params}`
    let response = await fetch(uri, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ search: ['postcode'] }),
    })

    if (response.ok) {
      let { addresses } = await response.json()
      addressList = addresses
      addresses = addresses.map((address) => {
        const finalAddress = address.formatted_address.reduce(
          (formatted, line) => {
            if (line.length > 0)
              formatted = formatted ? `${formatted}, ${line}` : line
            spinner.off()
            return formatted
          },
          '',
        )
        spinner.off()
        return finalAddress
      })
      displayAddresses(addresses)
      spinner.off()
      return
    }
    spinner.off()
    hideAddresses()
  }

  const hidePostcodes = () => {
    postcodeAutocomplete.innerHTML = ''
    postcodeAutocomplete.style.display = 'none'
  }

  const displayPostcodes = async (postcodes) => {
    hidePostcodes()
    const rect = postcode.getBoundingClientRect()

    if (postcodes.length === 1) {
      postcode.value = postcodes[0]
      await findAddresses()
      return
    }

    if (postcodes.length > 1) {
      postcodeAutocomplete.style.top = `${rect.bottom}px`
      postcodeAutocomplete.style.left = `${rect.left}px`
      postcodeAutocomplete.style.display = 'block'
      const fragment = document.createDocumentFragment()
      const ul = document.createElement('ul')
      postcodes.forEach((postcode) => {
        const li = document.createElement('li')
        li.textContent = postcode
        li.setAttribute('tabindex', 0)
        ul.appendChild(li)
      })
      fragment.appendChild(ul)
      postcodeAutocomplete.appendChild(fragment)
    }
  }

  const postcodeTypeahead = debounce(async (e) => {
    e.preventDefault()

    const params = new URLSearchParams({
      action: 'typeahead',
      term: postcode.value.trim(),
    })

    spinner.on()
    const uri = `/api/getaddress?${params}`
    let response = await fetch(uri, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ search: ['postcode'] }),
    })

    if (response.ok) {
      const postcodes = await response.json()
      displayPostcodes(postcodes)
      spinner.off()
      return
    }

    spinner.off()
    hidePostcodes()
  }, 1000)

  postcode.addEventListener('input', postcodeTypeahead)

  postcodeAutocomplete.addEventListener('click', async (e) => {
    const li = e.target.closest('li')
    if (!li) return

    postcode.value = li.textContent
    hidePostcodes()
    await findAddresses()
  })

  postcodeAutocomplete.addEventListener('keyup', async (e) => {
    if (e.key === 'Escape') {
      hidePostcodes()
      return
    }

    if (e.key === 'Enter') {
      const li = e.target.closest('li')
      if (!li) return
      hidePostcodes()
      postcode.value = li.textContent
      await findAddresses()
    }
  })

  postcodeAddresses.addEventListener('click', async (e) => {
    const li = e.target.closest('li')
    if (!li) return

    fillAddress(addressList[li.dataset.index])
    hideAddresses()
  })

  postcodeAddresses.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      hideAddresses()
      return
    }

    if (e.key === 'Enter') {
      const li = e.target.closest('li')
      if (!li) return
      fillAddress(addressList[li.dataset.index])
      hideAddresses()
    }
  })
}

const handlePurchase = () => {
  const dom = {
    purchase: document.getElementById('purchase'),
    category: document.getElementById('category'),
    productName: document.getElementById('product-name'),
    type: document.getElementById('type'),
    price: document.getElementById('price'),
    priceValue: document.getElementById('price-value'),
    recurring: document.getElementById('recurring'),
    recurringTimes: document.getElementById('recurring-times'),
    interval: document.getElementById('interval'),
    quantityLabel: document.getElementById('quantity-label'),
    quantity: document.getElementById('quantity'),
    totalLabel: document.getElementById('total-label'),
    total: document.getElementById('total'),
    pay: document.getElementById('pay'),
    // ids
    payment: document.getElementById('payment'),
    priceId: document.getElementById('price-id'),
    productId: document.getElementById('product-id'),
    customerId: document.getElementById('customer-id'),
    sourceId: document.getElementById('source-id'),

    // sections
    onBehalfOf: document.getElementById('on-behalf-of'),
    dateOfBirth: document.getElementById('date-of-birth'),
    gender: document.getElementById('gender'),
    address: document.getElementById('address'),
    preferences: document.getElementById('preferences'),
  }

  const params = new URLSearchParams(location.search)
  const category = params.get('category')
  const name = params.get('name')
  const recurring = params.get('recurring')
  const price = params.get('price')
  const type = params.get('type')
  const id = params.get('id')
  const product = params.get('product')

  dom.priceId.value = id
  dom.productId.value = product

  type ? (dom.type.textContent = `(${type})`) : (dom.type.textContent = '')
  dom.category.textContent = capitalize(category)
  dom.productName.textContent = name
  const priceValue = parseFloat(price.slice(1).replace(',', ''))
  dom.price.textContent = gbp.format(priceValue)
  dom.priceValue.value = priceValue
  dom.recurringTimes.value = recurring

  if (recurring === 'once') {
    dom.interval.textContent = ''
    hide(dom.recurring)
    hide(dom.onBehalfOf)
    hide(dom.dateOfBirth)
    hide(dom.gender)
    hide(dom.address)
    hide(dom.preferences)
  }

  if (recurring !== 'once') {
    dom.interval.textContent = recurring

    hide(dom.quantityLabel)
    hide(dom.totalLabel)
  }

  dom.total.value = gbp.format(priceValue)
  dom.quantity.addEventListener('change', () => {
    dom.total.value = gbp.format(dom.quantity.value * priceValue)
  })
  pay.addEventListener('click', (e) => {
    const type = e.target.id
    if (type === 'abandon') return history.back()
    dom.payment.value = type
  })
}

const init = () => {
  handlePurchase()
  handleCustomer()
  handlePreferences()
  handleDateOfBirth()
  handleAddress()
}

init()
