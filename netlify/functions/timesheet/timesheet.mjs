import { staff, timesheet, clock } from '../sumup/goodtill.mjs'

const handleLogin = async (staff, login) => {
  const found = staff.find(
    (member) => member.active && member.passcode === +login,
  )
  if (found) {
    try {
      const { id, staff_name: name, is_manager: manager, passcode } = found
      const sheet = await timesheet(id)

      return { id, name, manager, timesheet: sheet, passcode }
    } catch (error) {
      console.error(`failed fetching timesheet data [${error.message}]`)
    }
  }
  return { statusCode: 400, message: 'invalid login' }
}

const handleTimesheet = async (id = null) => {
  return timesheet(id)
}

export const handler = async (event) => {
  try {
    const { login, update, ts, id, start, end } = event.queryStringParameters
    const all = await staff()

    if (all.status) {
      let response = null
      if (login) response = await handleLogin(all.data, login)
      if (ts) response = await handleTimesheet(ts === 'null' ? null : ts)
      if (update) response = await clock(update, id, start, end)

      if (!response) response = all.data

      return {
        statusCode: response.statusCode ?? 200,
        headers: { 'content-type': 'application/json; charset="utf-8"' },
        body: JSON.stringify(response),
      }
    }

    return { statusCode: 500, body: all.message }
  } catch (error) {
    const message = `sumup failed to fetch data [${error.message}]`
    console.error(message)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json; charset="utf-8"' },
      body: JSON.stringify({ message }),
    }
  }
}
