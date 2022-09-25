const { log } = require('@andystevenson/lib/logger')
const csv = require('csv-parse/sync')
const { readFileSync } = require('node:fs')
const lint = require('./ashbourne-lint')

module.exports = (filename) => {
  try {
    if (!lint(filename)) throw Error(`${filename} has CSV formatting errors`)
    return csv.parse(readFileSync(filename), {
      columns: true,
      skipEmptyLines: true,
      skipRecordsWithError: true,
    })
  } catch (error) {
    const message = `ashbourne2json failed because [${error.message}]`
    log.error(message)
    throw Error(message)
  }
}
