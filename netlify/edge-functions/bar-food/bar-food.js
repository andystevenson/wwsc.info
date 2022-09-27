
import category from '../../../.cache/sumup/sumup-category-bar-food.json' assert { type: 'json' }
export default () => {
  return new Response(JSON.stringify(category), {
    headers: { 'content-type': 'application/json' },
  })
}
