const config = require('@andystevenson/lib/11ty')
const shortcodes = require('./src/shortcodes/shortcodes')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')
const sizes = require('rollup-plugin-sizes')

const vite = {
  viteOptions: {
    resolve: {
      alias: {
        '/@input': `${process.cwd()}/src`,
      },
    },
    build: {
      rollupOptions: {
        plugins: [sizes({ details: true })],
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
