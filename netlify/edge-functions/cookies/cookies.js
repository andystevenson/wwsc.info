export default async (request, context) => {
  const url = new URL(request.url)

  const identity = await url.searchParams.get('nf_jwt')
  context.log({ identity })
  return
}
