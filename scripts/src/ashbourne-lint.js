const { log } = require('@andystevenson/lib/logger')
const csv = require('csv-parse/sync')
const { readFileSync } = require('node:fs')

module.exports = (filename) => {
  log.info('linting....', filename)
  let ok = true
  const errors = { n: 0, errors: [] }
  const success = { n: 0, records: [] }
  try {
    csv.parse(readFileSync(filename), {
      columns: true,
      relax_column_count: true,
      raw: true,
      on_record({ raw, record }, context) {
        if (context.error) {
          // log.error({ context })
          const { message } = context.error
          log.info(context.error.message)
          log.error(raw)
          ok = false
          errors.n = errors.n + 1
          errors.errors.push({ message, raw })
          return
        }
        success.n = context.records
        success.records.push(record)
      },
    })
  } catch (error) {
    log.error(`ashbourne-lint failed because [${error.message}]`)
    ok = false
  }
  return ok ? { success } : { errors }
}

// module.exports(process.argv[2])
