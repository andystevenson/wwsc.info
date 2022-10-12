import { mkdirSync } from 'node:fs'

export default (dir) => {
  // make sure the cacheDir exists
  try {
    mkdirSync(dir, { recursive: true })
  } catch (error) {
    console.log(`failed to create [${cacheDir}] because [${error.message}]`)
    throw error
  }
}
