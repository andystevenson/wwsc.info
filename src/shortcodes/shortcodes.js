const safetify = require('@andystevenson/lib/safetify')
const isAsyncFunction = require('@andystevenson/lib/isAsyncFunction')
const icon = require('./icon')
const link = require('./link')
const imgc = require('./imgc')

const localShortcodes = {
  icon,
  link,
  imgc,
}
const safeShortcodes = {}
for (const fn in localShortcodes) {
  safeShortcodes[fn] = safetify(localShortcodes[fn])
}

const shortcodes = {
  ...safeShortcodes,
}

module.exports = (eleventyConfig) => {
  for (const shortcode in shortcodes) {
    const fn = shortcodes[shortcode]
    const isAsync = isAsyncFunction(fn)
    isAsync
      ? eleventyConfig.addAsyncShortcode(shortcode, fn)
      : eleventyConfig.addShortcode(shortcode, fn)
    eleventyConfig.addNunjucksGlobal(shortcode, fn)
  }
}
