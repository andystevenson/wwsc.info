export default (request, context) => {
  const { url } = request.url
  const identity = context.cookies.get('nf_jwt')
  context.log({ url, identity })
}
