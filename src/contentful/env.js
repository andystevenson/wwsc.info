const env = {
  api: process.env.CONTENTFUL_API,
  environment: process.env.CONTENTFUL_ENVIRONMENT,
  space: process.env.CONTENTFUL_SPACE,
  token: {
    management: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    delivery: process.env.CONTENTFUL_DELIVERY_TOKEN,
    preview: process.env.CONTENTFUL_PREVIEW_TOKEN,
  },
}

const values = [...Object.entries(env), ...Object.entries(env.token)]
values.forEach(([key, value]) => {
  if (!value) throw TypeError(`contentful ${key} cannot be empty [${value}]`)
})

module.exports = env
