const config = require('@andystevenson/lib/11ty')
const shortcodes = require('./src/shortcodes/shortcodes')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')
const { ViteMinifyPlugin } = require('vite-plugin-minify')

const vite = {
  tempFolderName: '.11ty-vite', // Default name of the temp folder

  // Defaults are shown:
  viteOptions: {
    clearScreen: false,
    plugins: [
      // input https://www.npmjs.com/package/html-minifier-terser options
      ViteMinifyPlugin({}),
    ],
    server: {
      mode: 'development',
      middlewareMode: true,
    },
    build: {
      mode: 'production',
    },
    resolve: {
      alias: {
        '/@root': process.cwd(),
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
