import ashbourne from '../../../.cache/sumup/sumup-check-card.json' assert { type: 'json' }

export const handler = async (event) => {
  let cardnumber = event.queryStringParameters?.cardnumber || null
  const result =
    cardnumber in ashbourne ? { found: ashbourne[+cardnumber] } : {}

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json',
    },
  }
}
