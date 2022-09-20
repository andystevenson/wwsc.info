export default (request, context) => {
  const { url, headers } = request
  const destination = headers.get('sec_fetch_dest')
  const content = headers.get('content-type')
  const identity = context.cookies.get('nf_jwt')
  context.log({ url, destination, identity, content, headers })
}
