import { utils, writeFileXLSX } from 'xlsx'
import cloneDeep from 'lodash.clonedeep'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
dayjs.extend(advancedFormat)

const spinner = {
  on() {
    document.getElementById('spinner').style.display = 'block'
  },
  off() {
    document.getElementById('spinner').style.display = 'none'
  },
}

const toDurationMinutes = (start, end) => {
  const diff = Math.floor((end.valueOf() - start.valueOf()) / 1000 / 60)
  return diff
}

const toDuration = (duration) => {
  const hours = Math.floor(duration / 60)
  const minutes = Math.floor(duration % 60)
  let time = ''
  if (hours) time += hours === 1 ? `${hours} hour` : `${hours} hours`
  if (minutes) {
    const plural = minutes === 1 ? 'minute' : 'minutes'
    time = time ? `${time} ${minutes} ${plural}` : `${minutes} ${plural}`
  }
  return time
}

const toDate = (string) => {
  const [date, time] = string.split(/\s|T/)
  const [year, month, day] = date.split('-')
  const [hour, minute, second] = time.split(':')

  const calendar = dayjs()
    .year(year)
    .month(month - 1)
    .date(day)
  const datetime = calendar
    .hour(hour)
    .minute(minute)
    .second(second ?? 0)
  return datetime
}

export default toDate

const login = document.getElementById('login')
const dialog = document.getElementById('dialog')
const digits = document.getElementById('digits')
const password = document.getElementById('password')
const form = document.getElementById('form')
const errorMessage = document.getElementById('error-message')
const username = document.getElementById('username')
const timesheet = document.getElementById('timesheet')
const duration = document.getElementById('duration')
const wallClock = document.getElementById('wall-clock')
const clockInButton = document.getElementById('clock-in')
const clockOutButton = document.getElementById('clock-out')
const logoutButton = document.getElementById('logout')
const logout2Button = document.getElementById('logout2')
const loggedIn = document.getElementById('logged-in')
const shiftTime = document.getElementById('shift-time')
const allTimesheets = document.getElementById('all-timesheets')
const dateRange = document.getElementById('date-range')

let user = null
let db = null
let dbFiltered = null

const datetimeFormat = 'YYYY-MM-DDTHH:mm'

const clearErrorMessage = () => {
  errorMessage.textContent = ''
}

const setErrorMessage = (message) => {
  errorMessage.textContent = message
  password.value = ''
}

const clearTimesheet = () => {
  timesheet.style.display = 'none'
  timesheet.innerHTML = ''
}

const displayTimesheet = (ts) => {
  if (ts.length === 0) return

  const sorted = sortTimesheet(ts)
  timesheet.style.display = 'grid'
  const fragment = document.createDocumentFragment()

  // only display the last 7 entries
  sorted.slice(-7).forEach((t) => {
    const { clock_in, clock_out, duration } = t
    const p0 = document.createElement('p')
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    const p3 = document.createElement('p')
    const clockInDate = toDate(clock_in)
    const clockOutDate = clock_out ? toDate(clock_out) : dayjs()
    p0.textContent = clock_in
      ? clockInDate.format('dddd, Do MMM, YYYY')
      : clock_in

    const today = dayjs()
    if (clockInDate.isSame(today, 'day')) p0.textContent = 'Today'
    p1.textContent = clock_in ? clockInDate.format('HH:mm') : clock_in
    p2.textContent = clock_out ? clockOutDate.format('HH:mm') : clock_out
    p3.textContent = toDuration(duration)
    fragment.appendChild(p0)
    fragment.appendChild(p1)
    fragment.appendChild(p2)
    fragment.appendChild(p3)
  })
  timesheet.appendChild(fragment)
}

const clearUsername = () => {
  username.style.display = 'none'
  username.textContent = ''
}

const displayUsername = (name) => {
  username.style.display = 'block'
  username.textContent = name
}

const displayAllTimesheets = () => (allTimesheets.style.display = 'block')
const clearAllTimesheets = () => (allTimesheets.style.display = 'none')

const clearAll = () => {
  clearAllTimesheets()
  clearUsername()
  clearErrorMessage()
  clearTimesheet()
  clearLoggedIn()
}

const sortTimesheet = (timesheet) => {
  return timesheet.sort((a, b) => {
    const { clock_in: aClockIn } = a
    const { clock_in: bClockIn } = b
    const aClock = toDate(aClockIn)
    const bClock = toDate(bClockIn)
    return aClock.valueOf() - bClock.valueOf()
  })
}

const getOpenTimesheet = (timesheet) => {
  return timesheet.find(
    (ts) => !ts.clock_out || toDate(ts.clock_in).isSame(dayjs(), 'day'),
  )
}

const checkIfClockedIn = () => {
  // has the logged in user already clocked in
  const { timesheet } = user
  const open = getOpenTimesheet(timesheet)
  user.clockedIn = open
  if (user.clockedIn) {
    const { clock_in, clock_out } = open
    user.clockedInAt = toDate(clock_in)

    if (clock_out) {
      user.clockedOut = open
      user.clockedOutAt = toDate(clock_out)
    }
  }
}

const clearLoggedIn = () => {
  loggedIn.style.display = 'none'
}

const displayLoggedIn = () => {
  loggedIn.style.display = 'grid'
  clockInButton.style.display = 'none'
  clockOutButton.style.display = 'none'

  if (user.clockedIn) {
    clockOutButton.style.display = 'block'
  }

  if (user.clockedOut) {
    clockOutButton.style.display = 'none'
  }

  if (!user.clockedIn && !user.clockedOut) {
    clockInButton.style.display = 'block'
  }

  if (user.manager) displayAllTimesheets()
}

const loginUser = (staff) => {
  clearTimesheet()
  clearErrorMessage()

  const { name, timesheet } = staff
  displayUsername(name)
  displayTimesheet(timesheet)
  checkIfClockedIn()
  displayLoggedIn()
}

const handleLogin = async (passcode) => {
  if (passcode.length !== 4) return

  const url = `/api/timesheet?login=${passcode}`
  dialog.close()
  console.log('dialog close')
  spinner.on()
  try {
    const response = await fetch(url)
    if (response.ok) {
      const json = await response.json()
      user = json
      loginUser(user)
      spinner.off()
      return user
    }

    const message = `invalid passcode`
    setErrorMessage(message)
    throw Error(message)
  } catch (error) {
    spinner.off()
    dialog.showModal()
    console.log('dialog showModal')

    setErrorMessage(error.message)
    console.error(error)
  }
}

const doLogin = () => {
  password.value = ''
  clearErrorMessage()
  clearTimesheet()
  dialog.showModal()
  console.log('dialog showModal')
}

login?.addEventListener('click', doLogin)
if (!login) doLogin()

digits?.addEventListener('click', async (e) => {
  const button = e.target.closest('button')
  if (!button) return

  clearErrorMessage()
  let valid = password.checkValidity()
  if (valid) return
  password.value += button.textContent
  await handleLogin(password.value)
})

password.addEventListener('input', async (e) => {
  clearErrorMessage()
  await handleLogin(password.value)
})

logoutButton.addEventListener('click', () => {
  location.reload()
})

logout2Button.addEventListener('click', () => {
  location.reload()
})

clockInButton.addEventListener('click', async () => {
  if (user.clockedIn) return

  const now = dayjs()
  const staff_id = user.id
  const id = user.clockedIn ? user.clockedIn.id : null
  const start = now.format('YYYY-MM-DD HH:mm:ss')
  const params = new URLSearchParams({ update: staff_id, start })
  if (id) params.append('id', id)
  let url = `/api/timesheet?${params}`
  try {
    const response = await fetch(url)
    if (response.ok) {
      // login the updated user
      await handleLogin(`${user.passcode}`)
      return
    }
    alert('failed to clock in!')
  } catch (error) {
    console.error(error)
  }
})

clockOutButton.addEventListener('click', async () => {
  if (user.clockedOut) return
  if (!user.clockedIn) return

  const now = dayjs()
  const staff_id = user.id
  const { id, clock_in: start } = user.clockedIn
  const end = now.format('YYYY-MM-DD HH:mm:ss')
  const params = new URLSearchParams({ update: staff_id, id, start, end })
  let url = `/api/timesheet?${params}`

  try {
    const response = await fetch(url)
    if (response.ok) {
      // login the updated user
      await handleLogin(`${user.passcode}`)
      return
    }
    alert('failed to clock out!')
  } catch (error) {
    console.error(error)
  }
})

setInterval(() => {
  const now = dayjs()
  wallClock.textContent = now.format('HH:mm:ss')
  shiftTime.style.display = 'none'

  if (user?.clockedInAt) {
    if (user.clockedOutAt) return
    shiftTime.style.display = 'grid'
    duration.textContent = toDuration(toDurationMinutes(user.clockedInAt, now))
  }

  updateOnduty()
}, 1000)

const timesheets = document.getElementById('timesheets')
const timesheetDatabase = document.getElementById('timesheet-database')

const getDateRange = () => dateRange.querySelector('.active').id

const clearDB = () => {
  timesheets.style.display = 'none'
  timesheetDatabase.innerHTML = ''
}

const displayDB = () => {
  timesheets.style.display = 'grid'

  const range = getDateRange()
  const today = dayjs().startOf('day')
  const week = today.startOf('week').add(1, 'day') // starts sundays by default
  const month = today.startOf('month')
  const last7 = today.subtract(7, 'days')
  const last14 = today.subtract(14, 'days')
  const last30 = today.subtract(30, 'days')
  const fromTimes = { today, week, month, last7, last14, last30 }

  const from = fromTimes[range]

  const fragment = document.createDocumentFragment()

  dbFiltered = db?.filter((ts) => {
    const clockInTime = toDate(ts.clock_in)
    return clockInTime.isAfter(from)
  })

  dbFiltered?.forEach((ts) => {
    // date, who, start, end, duration
    const { id, clock_in, clock_out, staff_name, duration } = ts
    const clockInDate = toDate(clock_in)
    let clockOutDate = clock_out
      ? toDate(clock_out)
      : clockInDate.add(1, 'minute')
    const p0 = document.createElement('p')
    p0.textContent = clockInDate.format('dddd, Do')
    p0.id = id
    const p1 = document.createElement('p')
    p1.textContent = staff_name
    const p2 = document.createElement('input')
    p2.setAttribute('type', 'datetime-local')
    p2.setAttribute('min', clockInDate.startOf('day').format(datetimeFormat))
    p2.setAttribute('max', clockInDate.endOf('day').format(datetimeFormat))
    p2.title = 'clock-in'
    p2.value = clockInDate.format(datetimeFormat)
    const p3 = document.createElement('input')
    p3.setAttribute('type', 'datetime-local')
    p3.setAttribute('min', clockInDate.add(1, 'minute').format(datetimeFormat))
    p3.setAttribute('max', clockInDate.add(24, 'hours').format(datetimeFormat))
    p3.title = 'clock-out'
    p3.value = clockOutDate.format(datetimeFormat)

    const p4 = document.createElement('p')
    if (!clock_out) {
      p4.dataset.onduty = true
      const minutes = toDurationMinutes(clockInDate, dayjs())
      shiftHours(minutes, p4, true)
    }

    if (clock_out) shiftHours(duration, p4)

    fragment.appendChild(p0)
    fragment.appendChild(p1)
    fragment.appendChild(p2)
    fragment.appendChild(p3)
    fragment.appendChild(p4)
  })

  const button = document.createElement('button')
  button.id = 'update'
  button.type = 'button'
  button.textContent = 'update'
  button.addEventListener('click', saveUpdates)

  fragment.appendChild(button)
  timesheetDatabase.appendChild(fragment)
}

function shiftHours(minutes, element, onduty = false) {
  const hours = minutes / 60
  element.textContent = onduty
    ? `${toDuration(minutes)} (on-duty)`
    : toDuration(minutes)

  delete element.dataset.longshift
  if (hours > 24) {
    element.dataset.longshift = 'invalid'
    element.title = 'invalid length of shift, probably forgot to logout!'
    return
  }

  if (hours > 16) {
    element.dataset.longshift = 'warning'
    element.title = 'warning extra long shift'
    return
  }
}

function updateOnduty() {
  if (!db) return
  let onduties = [...document.querySelectorAll('[data-onduty]')].map(
    (onduty) => {
      const co = onduty.previousElementSibling
      const ci = co.previousElementSibling
      return { p: onduty, ci, co }
    },
  )
  onduties.forEach((staff) => {
    const { p, ci, co } = staff
    const now = dayjs()
    co.value = now.format(datetimeFormat)
    const cid = toDate(ci.value)
    const minutes = toDurationMinutes(cid, now)
    shiftHours(minutes, p, true)
  })
}

const getDB = async () => {
  try {
    const url = '/api/timesheet?ts=null'
    const response = await fetch(url)
    if (response.ok) {
      const json = await response.json()
      db = sortTimesheet(json)
      return
    }

    throw Error(
      `failed to fetch timesheets [${response.status}, ${response.statusText}]`,
    )
  } catch (error) {
    console.error(error)
  }
}

const updateLocalTimesheet = (id, clockIn, clockOut, duration) => {
  if (!clockOut.isAfter(clockIn)) {
    // TODO: Modal?
    console.error(`clock-out must be before clock-in`)
    return
  }

  const found = dbFiltered?.find((ts) => ts.id === id)
  const clone = cloneDeep(found)
  if (!found) return

  found.clock_in = clockIn.format('YYYY-MM-DD HH:mm:ss')
  found.clock_out = clockOut.format('YYYY-MM-DD HH:mm:ss')
  found.duration = duration // in minutes
  found.updated = true
}

const changeDatetimes = (input) => {
  const clockIn =
    input.title === 'clock-in' ? input : input.previousElementSibling
  const clockOut = clockIn.nextElementSibling
  const duration = clockOut.nextElementSibling
  const id = clockIn.previousElementSibling.previousElementSibling.id

  const clockInDate = toDate(clockIn.value)
  let clockOutDate = toDate(clockOut.value)
  const min = clockOut.getAttribute('min')
  const max = clockOut.getAttribute('max')
  const clockOutMin = toDate(min)
  const clockOutMax = toDate(max)

  if (clockOutDate.isBefore(clockOutMin)) {
    clockOutDate = clockOutMin
    clockOut.value = clockOutMin.format(datetimeFormat)
  }

  if (clockOutDate.isAfter(clockOutMax)) {
    clockOutDate = clockOutMax
    clockOut.value = clockOutMax.format(datetimeFormat)
  }

  delete duration.dataset.onduty
  const minutes = toDurationMinutes(clockInDate, clockOutDate)
  shiftHours(minutes, duration)

  input.dataset.changed = true
  updateLocalTimesheet(id, clockInDate, clockOutDate, minutes)
}

timesheetDatabase.addEventListener('change', (e) => {
  const input = e.target.closest('input')
  if (!input) return

  changeDatetimes(input)
})

allTimesheets?.addEventListener('click', async () => {
  spinner.on()
  user = null
  clearAll()
  await getDB()
  displayDB()
  spinner.off()
})

dateRange?.addEventListener('click', (e) => {
  const button = e.target.closest('button')
  if (!button) return

  const active = dateRange.querySelector('.active')
  active?.classList.remove('active')
  button.classList.add('active')
  clearDB()
  displayDB()
})

const toXLSX = () => {
  let json = dbFiltered.map((ts) => {
    const { staff_name, clock_in, clock_out } = ts
    const clockInDate = toDate(clock_in)
    const clockOutDate = clock_out ? toDate(clock_out) : null
    const dateClockIn = new Date(clockInDate.valueOf())
    const dateClockOut = clock_out ? new Date(clockOutDate.valueOf()) : null
    let duration = null
    if (clock_out) {
      const diff = (clockOutDate.valueOf() - clockInDate.valueOf()) / 1000 / 60
      // diff in minutes
      const hours = Math.floor(diff / 60)
      const minutes = Math.floor(diff % 60)
      duration = (hours + minutes / 60).toFixed(2)
    }
    return {
      name: staff_name,
      'clock-in': dateClockIn,
      'clock-out': dateClockOut,
      duration: +duration,
    }
  })

  const worksheet = utils.json_to_sheet(json, { dateNF: 'yyyy-mm-dd hh:mm:ss' })
  /* calculate column width */
  const max_width = json.reduce((w, r) => Math.max(w, r.name.length), 10)
  worksheet['!cols'] = [
    { wch: max_width },
    { wch: 17 },
    { wch: 17 },
    { wch: 7 },
  ]

  const summary = json.reduce((s, ts) => {
    const { name, duration } = ts
    name in s ? (s[name] += +duration) : (s[name] = +duration)
    return s
  }, {})

  json = []
  for (const name in summary) {
    json.push({ name, hours: summary[name] })
  }
  const summaryWorksheet = utils.json_to_sheet(json)
  summaryWorksheet['!cols'] = [{ wch: max_width }, { wch: 8 }]
  /* generate worksheet and workbook */
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'timesheet')
  utils.book_append_sheet(workbook, summaryWorksheet, 'summary')

  /* fix headers */
  // XLSX.utils.sheet_add_aoa(worksheet, [["Name", "Birthday"]], { origin: "A1" });

  /* create an XLSX file and try to save to Presidents.xlsx */
  writeFileXLSX(workbook, 'timesheets.xlsx', { compression: true })
}

const updateDB = async () => {
  const updates = dbFiltered?.filter((ts) => ts.updated)
  const checks = timesheetDatabase.checkValidity()

  console.log({ updates, checks })
  try {
    for (const change of updates) {
      const { id, staff_id: update, clock_in: start, clock_out: end } = change
      const params = new URLSearchParams({ update, id, start, end })
      const url = `/api/timesheet?${params}`
      const response = await fetch(url)
      if (response.ok) {
        const json = await response.json()
        delete change.updated
        console.log('update success', json)
      } else {
        console.log(
          `update failed [${response.status}, ${response.statusText}]`,
        )
      }
    }
  } catch (error) {
    throw error
  }
}

async function saveUpdates(e) {
  console.log('saveUpdates')
  e.preventDefault()

  spinner.on()
  try {
    await updateDB()
    toXLSX()
  } catch (error) {
    console.error(`failed to update sumup db`)
    console.error(error)
  }
  spinner.off()
}
