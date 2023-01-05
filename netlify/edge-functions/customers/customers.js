import customers from '../../../.cache/sumup/sumup-customers-updated.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(customers), {
    headers: { 'content-type': 'application/json' },
  })
}
