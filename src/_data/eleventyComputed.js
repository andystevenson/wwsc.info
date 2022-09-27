// should really go in ajs/11ty.js
const { statSync } = require('fs')

module.exports = {
  pageTitle: (data) => {
    return data.page.fileSlug || 'WWSC'
  },
  pageScript: (data) => {
    let src = `${data.page.fileSlug || 'WWSC'}.js`
    try {
      // throws if file does not exist
      const stat = statSync(`./src/js/pages/${src}`)
    } catch (error) {
      src = undefined
    }
    return src
  },
  site: 'https://westwarwicks.info',
  company: 'West Warwickshire Sports Complex - Information Base',
  description: 'West Warwickshire Sports Complex - information database.',
  email: 'andy@westwarwicks.co.uk',
  telephone: '+44 121 706 3594',
}
