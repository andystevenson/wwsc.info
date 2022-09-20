export default (_, context) => {
  const identity = context.cookies.get('nf_jwt')
  context.log({ identity })
}
