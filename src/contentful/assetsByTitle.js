const fetch = require('./fetch')

module.exports = async (title) => {
  const query = `
  {
    assetCollection(where: {title: "${title}"}) {
      items {
        title
        description
        url
        sys {
          publishedAt
        }
      }
    }
  }
`
  try {
    const assets = await fetch(query)
    return assets.assetCollection.items
  } catch (error) {
    throw Error(`could not fetch assetsByTitle because [${error.message}]`)
  }
}
