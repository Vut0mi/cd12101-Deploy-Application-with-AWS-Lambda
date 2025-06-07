// src/config.js

const apiId = 'wmgy8quzaa'

export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-pzam8f6wltxjvgap.us.auth0.com',
  clientId: 'ks6ZfrAiNrNA4HD5iqsNNRy3rRljPPYz',
  callbackUrl: 'http://localhost:3000/callback',
  audience: 'https://todo-api.dev'
}
