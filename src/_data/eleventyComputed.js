// should really go in ajs/11ty.js
const { statSync } = require('fs')

module.exports = {
  pageTitle: (data) => {
    return data.page.fileSlug || 'WWSC'
  },
  pageScript: (data) => {
    let src = `${data.page.fileSlug || 'WWSC'}.js`
    let msrc = `${data.page.fileSlug || 'WWSC'}.mjs`
    const stat = statSync(`./src/js/pages/${src}`, { throwIfNoEntry: false })
    const mstat = statSync(`./src/js/pages/${msrc}`, { throwIfNoEntry: false })
    msrc = mstat ? msrc : null
    src = stat ? src : null
    return msrc || src
  },
  site: 'https://westwarwicks.info',
  company: 'West Warwickshire Sports Complex - Information Base',
  description: 'West Warwickshire Sports Complex - information database.',
  email: 'andy@westwarwicks.co.uk',
  telephone: '+44 121 706 3594',
}
