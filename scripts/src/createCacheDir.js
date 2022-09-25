const { mkdirSync } = require('node:fs')

module.exports = (dir) => {
  // make sure the cacheDir exists
  try {
    mkdirSync(dir, { recursive: true })
  } catch (error) {
    console.log(`failed to create [${cacheDir}] because [${error.message}]`)
    process.exit(1)
  }
}
