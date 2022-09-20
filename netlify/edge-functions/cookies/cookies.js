export default (request, context) => {
  const { url } = request
  const identity = context.cookies.get('nf_jwt')
  context.log({ url, identity })
}
