const config = require('@andystevenson/lib/11ty')
const shortcodes = require('./src/shortcodes/shortcodes')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')

const vite = {
  viteOptions: {
    resolve: {
      alias: {
        '/@input': `${process.cwd()}/src`,
      },
    },
  },
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyVitePlugin, vite)
  const newConfig = config(eleventyConfig)
  shortcodes(eleventyConfig)
  eleventyConfig.addPassthroughCopy('./public/**')
  return newConfig
}
