// updated to drive new node version for lambda functions

export default () => {
  return new Response(JSON.stringify({ message: 'hello world!' }), {
    headers: { 'content-type': 'application/json' },
  })
}
