import join from '../../../.cache/stripe/join.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(join), {
    headers: { 'content-type': 'application/json' },
  })
}
