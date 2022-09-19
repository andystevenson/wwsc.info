const { permutateAll } = require('@andystevenson/lib/permutations')
const { log } = require('@andystevenson/lib/logger')

// process all the content from CONTENTFUL CMS

const { sortBy, without } = require('lodash')

const createTags = (assets) => {
  const tags = {}
  assets.forEach((asset) => {
    const permutations = permutateAll(asset.tags)
    // inspect('asset', asset.title, asset.tags, permutations)
    permutations.forEach((permutation) => {
      const { name } = permutation
      // inspect(`adding ${asset.title} to tag ${permutation.name}`)
      if (name in tags) return tags[name].push(asset)
      tags[name] = [asset]
    })
  })
  return tags
}

const createAssets = (assets) => {
  return assets.map((asset) => {
    asset.tags = asset.contentfulMetadata.tags.map((tag) => tag.id)
    asset.id = asset.sys.id
    delete asset.contentfulMetadata
    delete asset.sys
    return asset
  })
}

const createIcons = (tags) => {
  const icons = {}
  for (const icon of tags.icon) {
    const { title } = icon
    icons[title] = icon
  }

  return icons
}

const createAssetByTitle = (assets) => {
  const collection = {}
  assets.forEach((asset) => {
    const { title } = asset
    if (title in collection) {
      log.warn(`asset has a duplicate [${title}]`)
      // don't overwrite the existing one
      return
    }
    collection[title] = asset
  })

  return collection
}

const createImageByTitle = (assets) => {
  const collection = {}
  assets.forEach((asset) => {
    const { title, contentType } = asset
    if (!contentType.startsWith('image/')) return

    if (title in collection) {
      log.warn(`image has a duplicate [${title}]`)
      // don't overwrite the existing one
      return
    }
    collection[title] = asset
  })

  return collection
}

const createVideoByTitle = (assets) => {
  const collection = {}
  assets.forEach((asset) => {
    const { title, contentType } = asset
    if (!contentType.startsWith('video/')) return

    if (title in collection) {
      log.warn(`video has a duplicate [${title}]`)
      // don't overwrite the existing one
      return
    }
    collection[title] = asset
  })

  return collection
}

const createDocByTitle = (assets) => {
  const collection = {}
  assets.forEach((asset) => {
    const { title, contentType } = asset
    if (contentType.startsWith('image/') || contentType.startsWith('video/'))
      return

    if (title in collection) {
      log.warn(`document has a duplicate [${title}]`)
      // don't overwrite the existing one
      return
    }
    collection[title] = asset
  })

  return collection
}

const assets = {
  name: 'assets',
  transform: (data) => {
    let { items } = data?.assetCollection
    const assets = createAssets(items)
    const tags = createTags(assets)
    const icons = createIcons(tags)
    const asset = createAssetByTitle(assets)
    const image = createImageByTitle(assets)
    const video = createVideoByTitle(assets)
    const doc = createDocByTitle(assets)
    // log.info(asset)

    const content = { asset, assets, tags, icons, image, video, doc }
    return content
  },
  query: `
{
  assetCollection(limit: 1000) {
    items {
      title
      contentType
      description
      url
      size,
      width
      height
      contentfulMetadata {
        tags {
          id
        }
      }
      sys {
        id
      }
    }
  }
}`,
}

const createTaggedLinks = (links) => {
  const tags = {}

  for (const link of links) {
    for (const tag of link.image.contentfulMetadata.tags) {
      const { name } = tag
      name in tags ? tags[name].push(link) : (tags[name] = [link])
    }
  }

  return tags
}

const createNamedLink = (links) => {
  const named = {}

  for (const link of links) {
    named[link.name] = link
  }

  return named
}
const markExternalLinks = (links) => {
  links.forEach((link) => {
    link.href.includes('https:')
      ? (link.external = true)
      : (link.external = false)
  })
}

// TODO: should check for name clashes!!!!
const links = {
  name: 'links',
  transform: (data) => {
    let { items: all } = data?.linksCollection
    markExternalLinks(all)
    const content = {
      links: { all, ...createTaggedLinks(all), ...createNamedLink(all) },
    }
    // console.log(util.inspect(content, undefined, null, true))

    return content
  },
  query: `
            {
              linksCollection {
                items {
                  name
                  description
                  href
                  image {
                    title
                    description
                    contentType
                    fileName
                    size
                    url
                    width
                    height
                    contentfulMetadata {
                      tags {
                        name
                      }
                    }
                  }
                }
              }
            }
  `,
}

const createSections = (people) => {
  return people.reduce((sections, person) => {
    person.section.forEach((section) => {
      section in sections
        ? sections[section].members.push(person)
        : (sections[section] = {
            title: section,
            email: `${section}@westwarwicks.co.uk`,
            members: [person],
          })
    })

    // sort the members into presentation 'sequence'
    for (const section in sections) {
      const sorted = sortBy(sections[section].members, ['sequence'])
      sections[section].members = sorted
    }

    return sections
  }, {})
}

const annotateTrustees = (trustees) => {
  trustees.forEach((trustee) => {
    let roles =
      trustee.roles.length > 1
        ? without(trustee.roles, 'chairman')
        : trustee.roles
    const role = without(roles, 'committee member')[0]
    const section = without(trustee.section, 'staff', 'trustees')[0]
    trustee.trustees = { role, section }
  })
  return trustees
}

const annotateStaff = (staff) => {
  staff.forEach((member) => {
    const role = without(member.roles, 'committee member')[0]
    member.staff = { role }
  })
  return staff
}

const people = {
  name: 'people',
  transform: (data) => {
    // screwed up the not renaming the content-type-id!
    let { items: all } = data?.staffCollection

    const sections = createSections(all)
    const content = {
      people: { all, ...sections },
    }

    annotateTrustees(content.people.trustees.members)
    annotateStaff(content.people.staff.members)
    // console.log(util.inspect(content, undefined, null, true))

    return content
  },
  query: `
            {
              staffCollection {
                items {
                  sequence
                  email
                  fullname
                  roles
                  section
                  bio
                  image {
                    title
                    description
                    contentType
                    fileName
                    url
                    width
                    height
                    contentfulMetadata {
                      tags {
                        name
                      }
                    }
                  }
                }
              }
            }
  `,
}
// all the collections we are going to gather

const collections = [assets, links, people]

module.exports = async () => {
  const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

  const contentful = {
    api: process.env.CONTENTFUL_API,
    environment: process.env.CONTENTFUL_ENVIRONMENT,
    space: process.env.CONTENTFUL_SPACE,
    token: {
      management: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
      delivery: process.env.CONTENTFUL_DELIVERY_TOKEN,
      preview: process.env.CONTENTFUL_PREVIEW_TOKEN,
    },
  }

  let cms = {}
  for (const collection of collections) {
    const { name, query, transform } = collection
    console.log(`processing ${name} collection`)
    const response = await fetch(contentful.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentful.token.delivery}`,
      },
      body: JSON.stringify({ query }),
    })
    const json = await response.json()
    const content = transform(json.data)
    cms = { ...cms, ...content }
  }

  // console.log(util.inspect(cms, undefined, null, true))
  return cms
}
