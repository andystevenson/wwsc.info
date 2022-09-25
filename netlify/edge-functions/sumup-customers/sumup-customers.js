import sumup from '../../../.cache/sumup/sumup-customers-updated.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(sumup), {
    headers: { 'content-type': 'application/json' },
  })
}
