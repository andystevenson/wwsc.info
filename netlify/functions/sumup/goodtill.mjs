// updated to drive new node version for lambda functions

import fetch from 'node-fetch'
import dayjs from 'dayjs'
import toDate from './toDate.mjs'

export async function clockUpdate(id, staff_id, start, end) {
  const now = new Date()
  const today = dayjs(now)
  const clock_in = start ? start : today.format('YYYY-MM-DD HH:mm:ss')
  const clock_out = end

  const url = `https://api.thegoodtill.com/api/staff_clock_records/${id}`
  try {
    await login()
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...authorization(), 'content-type': 'application/json' },
      body: JSON.stringify({ staff_id, clock_in, clock_out }),
    })
    await logout()

    if (response.ok) {
      let json = await response.json()
      return json.data
    }

    throw Error(
      `timesheet clock update failed [${response.status}, ${response.statusText}]`,
    )
  } catch (error) {
    throw error
  }
}

const findTodaysRecord = (records, staff_id) => {
  const today = dayjs()
  const staffRecords = records.filter((record) => {
    return record.staff_id === staff_id
  })
  const record = staffRecords.find((record) => {
    const { clock_in } = record
    const clockInDate = toDate(clock_in)
    if (clockInDate.isSame(today, 'day')) return true
    // if (clock_out && toDate(clock_out).isSame(today, 'day')) return true
  })

  return record
}

export async function clockIn(staff_id, start = null) {
  const now = new Date()
  const today = dayjs(now)
  const clock_in = start ? start : today.format('YYYY-MM-DD HH:mm:ss')

  let url = 'https://api.thegoodtill.com/api/staff_clock_records'

  try {
    await login()
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...authorization(), 'content-type': 'application/json' },
      body: JSON.stringify({ staff_id, clock_in }),
    })
    await logout()

    if (response.ok) {
      const json = await response.json()
      return json.data
    }

    throw Error(
      `failed to clock in [${response.status}, ${response.statusText}]`,
    )
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function clock(staff_id, id = null, start = null, end = null) {
  try {
    let url = 'https://api.thegoodtill.com/api/staff_clock_records'
    if (id) url = `${url}/${id}`
    await login()
    const response = await fetch(url, { headers: { ...authorization() } })
    await logout()

    if (response.ok) {
      let records = await response.json()
      records = id
        ? [records.data]
        : records.data.map(
            ({ id, staff_id, staff_name, clock_in, clock_out }) => ({
              id,
              staff_id,
              staff_name,
              clock_in,
              clock_out,
            }),
          )

      // if id is set then it is update of the specific record
      if (id) {
        const { staff_id } = records[0]
        return await clockUpdate(id, staff_id, start, end)
      }
      // else we need to find today's record for the staff member or

      const todaysRecord = findTodaysRecord(records, staff_id)
      if (todaysRecord) {
        const { id } = todaysRecord
        return await clockUpdate(id, staff_id, start, end)
      }
      // create a new record
      return await clockIn(staff_id, start)
    }
  } catch (error) {
    throw error
  }
}

export async function timesheet(id = null) {
  try {
    const url = 'https://api.thegoodtill.com/api/staff_clock_records'
    await login()
    const response = await fetch(url, { headers: { ...authorization() } })
    await logout()

    if (response.ok) {
      let json = await response.json()

      if (id) json = json.data?.filter((record) => record.staff_id === id)

      json = json.data ? json.data : json

      return json.map(
        ({ id, staff_id, staff_name, clock_in, clock_out, duration }) => ({
          id,
          staff_id,
          staff_name,
          clock_in,
          clock_out,
          duration,
        }),
      )
    }

    throw Error(`sumup timesheet failed [${response.statusText}]`)
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

export async function staff() {
  try {
    const url = 'https://api.thegoodtill.com/api/staffs'
    await login()
    const response = await fetch(url, { headers: { ...authorization() } })
    await logout()

    if (response.ok) {
      const json = await response.json()
      return json
    }

    throw Error(`sumup staff failed [${response.statusText}]`)
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

export async function sales(daterange = null) {
  try {
    const url = 'https://api.thegoodtill.com/api/report/sales/summary'
    await login()
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...authorization(), 'content-type': 'application/json' },
      body: daterange ? JSON.stringify(daterange) : '{}',
    })
    await logout()

    if (response.ok) {
      const json = await response.json()
      return json
    }

    throw Error(`sumup sales failed [${response.statusText}]`)
  } catch (error) {
    console.error(`sumup sales for today failed [${error.message}]`)
    throw error
  }
}

let credentials = null
export async function login() {
  const authentication = {
    subdomain: process.env.GOODTILL_SUBDOMAIN,
    username: process.env.GOODTILL_USERNAME,
    password: process.env.GOODTILL_PASSWORD,
  }

  const url = 'https://api.thegoodtill.com/api/login'

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(authentication),
  })

  if (response.ok) {
    const json = await response.json()
    credentials = json
    return credentials
  }

  throw Error(`sumup login failed [${response.statusText}]`)
}

export function authorization() {
  if (!credentials) throw Error(`sumup credentials require login`)
  const { token } = credentials
  return { Authorization: `Bearer ${token}` }
}

export async function logout() {
  // not logged in so it is a no-op
  if (!credentials) return

  try {
    const url = 'https://api.thegoodtill.com/api/logout'

    const response = await fetch(url, {
      method: 'POST',
      headers: authorization(),
    })
    if (response.ok) {
      const json = await response.json()
      return json
    }
    throw Error(`sumup logout failed [${response.statusText}]`)
  } catch (error) {
    console.error(`sumup logout error [${error.message}]`)
    throw error
  }
}

export default sales
