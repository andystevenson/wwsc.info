import ashbourne from '../../../.cache/ashbourne/ashbourne.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(ashbourne), {
    headers: { 'content-type': 'application/json' },
  })
}
