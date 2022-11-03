import { find } from 'lodash'
import debounce from 'lodash.debounce'

const form = document.getElementById('stripe-customer')

const address = document.getElementById('address')
const addressInputs = [...address.querySelectorAll('input')]
const postcode = addressInputs[0]
const postcodeAutocomplete = document.getElementById('postcode-autocomplete')
const postcodeAddresses = document.getElementById('postcode-addresses')
let addressList = []

const fillAddress = (selected) => {
  console.log({ selected })
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

  const nameAutocomplete = document.getElementById('name-autocomplete')
  const emailAutocomplete = document.getElementById('email-autocomplete')
  let emails = []
  let names = []

  newOrExisting.addEventListener('change', (e) => {
    console.log('new-or-existing', e.target)
  })

  const selectCustomer = (customer) => {
    name.value = customer.name
    email.value = customer.email

    const { address } = customer
    fillAddress(address)
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

    const displayName = (customers) => {
      hideCustomers(nameAutocomplete)
      if (customers.length === 0) return
      if (customers.length === 1) {
        selectCustomer(customers[0])
        return
      }

      displayCustomers(customers, name, nameAutocomplete)
    }

    console.log('name=', name.value)
    const url = `/api/stripe-customers/?name=${name.value}`
    try {
      const response = await fetch(url, { method: 'POST' })
      if (response.ok) {
        const json = await response.json()
        names = json
        console.log('name json', json)
        displayName(names, nameAutocomplete)
      }
    } catch (error) {
      console.log(`stripe-customers failed because [${error.message}]`)
    }
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    if (newElement.checked) return

    const displayEmail = (customers) => {
      hideCustomers(emailAutocomplete)
      if (customers.length === 0) return
      if (customers.length === 1) {
        selectCustomer(customers[0])
        return
      }

      displayCustomers(customers, email, emailAutocomplete)
    }

    console.log('email=', email.value)
    const url = `/api/stripe-customers/?email=${email.value}`
    try {
      const response = await fetch(url, { method: 'POST' })
      if (response.ok) {
        const json = await response.json()
        emails = json
        console.log('email json', json)
        displayEmail(emails, emailAutocomplete)
      }
    } catch (error) {
      console.log(`stripe-customers failed because [${error.message}]`)
    }
  }

  name.addEventListener('input', debounce(handleName, 1000))
  email.addEventListener('input', debounce(handleEmail, 1000))

  emailAutocomplete.addEventListener('click', (e) => {
    const li = e.target.closest('li')
    if (!li) return

    console.log({ li }, li.dataset)
    const index = li.dataset.index
    const selected = emails[index]
    console.log('email selected', index, selected, this)
    selectCustomer(selected)
    hideCustomers(emailAutocomplete)
  })

  nameAutocomplete.addEventListener('click', (e) => {
    const li = e.target.closest('li')
    if (!li) return

    console.log({ li }, li.dataset)
    const index = li.dataset.index
    const selected = emails[index]
    console.log('name selected', index, selected, this)
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
    console.log('changed', e.target)
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

    const uri = `/api/getaddress?${params}`
    let response = await fetch(uri, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ search: ['postcode'] }),
    })

    if (response.ok) {
      let { addresses } = await response.json()
      addressList = addresses
      console.log({ addresses })
      addresses = addresses.map((address) => {
        const finalAddress = address.formatted_address.reduce(
          (formatted, line) => {
            if (line.length > 0)
              formatted = formatted ? `${formatted}, ${line}` : line
            return formatted
          },
          '',
        )
        return finalAddress
      })
      displayAddresses(addresses)
      return
    }
    hideAddresses()
  }

  const hidePostcodes = () => {
    postcodeAutocomplete.innerHTML = ''
    postcodeAutocomplete.style.display = 'none'
  }

  const displayPostcodes = async (postcodes) => {
    hidePostcodes()

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

    const uri = `/api/getaddress?${params}`
    let response = await fetch(uri, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ search: ['postcode'] }),
    })

    if (response.ok) {
      const postcodes = await response.json()
      console.log({ postcodes })
      displayPostcodes(postcodes)
      return
    }

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
    console.log('postcodeAutocomplete', e.key)
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

const init = () => {
  handleCustomer()
  handlePreferences()
  handleDateOfBirth()
  handleAddress()
}

init()
