export default (request, context) => {
  const { url, destination } = request
  const identity = context.cookies.get('nf_jwt')
  context.log({ url, destination, identity, request })
}
