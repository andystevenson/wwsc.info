#!/usr/bin/env node

const { basename } = require('node:path')
const {
  copyFileSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} = require('node:fs')
const { exit } = require('node:process')
const date = require('dayjs')
const { kebabCase, sortBy, uniq } = require('lodash')
const { stripIndents } = require('common-tags')

const { log } = require('@andystevenson/lib/logger')
const createCacheDir = require('./src/createCacheDir')

const name = basename(__filename, '.js')
const cacheDir = '.cache/sumup'
const productsFile = `${cacheDir}/sumup-products.json`
const categoriesFile = `${cacheDir}/sumup-categories.json`

const normalize = (categories, products) => {
  // turn them into a lookup table by id
  const normalized = categories.reduce((lookup, category) => {
    lookup[category.id] = category
    return lookup
  }, {})

  products.reduce((lookup, product) => {
    lookup[product.id] = product
    return lookup
  }, normalized)

  return normalized
}

const byProduct = (entry) =>
  'has_variant' in entry && !entry.has_variant && entry.display_name

const mapFields = (product, normalized) => {
  let {
    id,
    product_sku: sku,
    product_name: name,
    display_name: display,
    parent_product_id: parent,
    category_id: category,
    selling_price: price,
    active,
  } = product

  category = normalized[category]?.name
  price = Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)

  let tag = sku.split('/')[1]?.toLowerCase()

  return { id, sku, name, tag, display, parent, category, price, active }
}

const variants = (all, product) => {
  const { id, parent, name } = product
  if (parent) {
    all[parent] = all[parent]
      ? all[parent]
      : {
          name: name.replace(/\s*\(.*\)\s*/, ''),
          tag: null,
          active: 1,
          variants: [],
        }
    all[parent].variants.push(product)
    return all
  }

  all[id] = product
  return all
}

const tagsFromVariants = (variants) => {
  let tags = variants.reduce((tags, { tag }) => {
    tag && tags.push(tag)
    return tags
  }, [])

  if (tags.length === 0) return null
  tags = uniq(tags)
  tags = tags.length === 1 ? tags[0] : tags
  return tags
}

const simplify = (normalized) => {
  // filter to just a set of products, then
  // map the fields we want to process, then
  // cluster product variants together into a single product

  let result = Object.values(normalized)
    .filter(byProduct)
    .map((product) => mapFields(product, normalized))
    .reduce(variants, {})

  // sort products with variants into ascending price order
  Object.values(result).forEach((product) => {
    const { variants } = product
    if (!variants) return

    // sort
    product.variants = sortBy(variants, [
      (variant) => +variant.price.replace('£', ''),
    ])

    // verify at least one variant is active
    product.active = variants.some((variant) => variant.active)
    product.tag = tagsFromVariants(variants)
  })

  // group the products back into their categories
  result = Object.values(result).reduce((categories, product) => {
    let { category, variants } = product
    category = category ? category : variants[0].category
    categories[category] = categories[category] ? categories[category] : []
    categories[category].push(product)
    return categories
  }, {})

  return result
}

const writeCategoryFiles = (simplified) => {
  for (const category in simplified) {
    const kCategory = kebabCase(category)
    const outputFile = `${cacheDir}/sumup-category-${kCategory}.json`
    log.info(`${name} writing ${kCategory}`)
    writeFileSync(outputFile, JSON.stringify(simplified[category], null, 2))
  }
  log.info(`${name} writing all categories`)
  writeFileSync(categoriesFile, JSON.stringify(simplified, null, 2))
}

const edgeFunctionsList = (simplified) => {
  const list = [
    'resources',
    ...Object.keys(simplified).map((key) => kebabCase(key)),
  ]
  log.info({ list })
  return list
}

const edgeFunctionTemplate = (category) => `
import category from '../../../.cache/sumup/sumup-category-${category}.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(category), {
    headers: { 'content-type': 'application/json' },
  })
}
`
const edgeFunctions = (list) => {
  const functionFiles = []
  for (const category of list) {
    const edgeFunctionDir = `./netlify/edge-functions/${category}`
    mkdirSync(edgeFunctionDir, { recursive: true })
    const edgeFunctionFile = `${edgeFunctionDir}/${category}.js`
    functionFiles.push(edgeFunctionDir)
    writeFileSync(edgeFunctionFile, edgeFunctionTemplate(category))
  }

  const edgeFunctionListFile = `${cacheDir}/sumup-edge-functions.json`
  writeFileSync(edgeFunctionListFile, JSON.stringify(functionFiles, null, 2))

  const resourcesFile = `${cacheDir}/sumup-category-resources.json`
  writeFileSync(resourcesFile, JSON.stringify(list, null, 2))
}

const edgeFunctionRedirects = (list) => {
  const edgeFunctions = list
    .map(
      (category) => stripIndents`
    [[edge_functions]]
    function="${category}"
    path="/api/${category}"
  `,
    )
    .join('\n\n')

  return `\n${edgeFunctions}\n`
}

const updateNetlifyToml = (list) => {
  const netlifyTomlFile = './netlify.toml'
  const backupFile = '.cache/.netlify.toml'

  copyFileSync(netlifyTomlFile, backupFile)

  const regex =
    /(?<=# start-generated-edge-functions)([\S\s]*)(?=# end-generated-edge-functions)/gm
  const replaceWith = edgeFunctionRedirects(list)

  let file = readFileSync(netlifyTomlFile, 'utf-8')
  file = file.replace(regex, replaceWith)
  writeFileSync(netlifyTomlFile, file)
}

const buildCategories = () => {
  createCacheDir(cacheDir)
  const { categories, products } = JSON.parse(readFileSync(productsFile))
  const simplified = simplify(normalize(categories, products))

  writeCategoryFiles(simplified)
  const list = edgeFunctionsList(simplified)
  edgeFunctions(list)
  updateNetlifyToml(list)

  log.info(`${name} updated`)
}

const process = () => {
  try {
    log.info(`${name}...`)
    const productsStat = statSync(productsFile, { throwIfNoEntry: false })
    if (!productsStat) throw Error(`cache-sumup-products needs to be run first`)

    const categoriesStat = statSync(categoriesFile, { throwIfNoEntry: false })
    if (!categoriesStat) return buildCategories()

    const productsDate = date(productsStat.mtime)
    const categoriesDate = date(categoriesStat.mtime)
    if (productsDate.isAfter(categoriesDate)) return buildCategories()

    log.info(`${name} is up to date`)
  } catch (error) {
    log.error(`${name} failed because [${error.message}]`)
    exit(1)
  }
}

process()
