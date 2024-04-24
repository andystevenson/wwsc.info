// updated to drive new node version for lambda functions

import times from '../../../.cache/opening-times/opening-times.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(times), {
    headers: { 'content-type': 'application/json' },
  })
}
