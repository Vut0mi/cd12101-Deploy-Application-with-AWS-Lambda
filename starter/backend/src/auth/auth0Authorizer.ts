import {
  APIGatewayTokenAuthorizerEvent,
  CustomAuthorizerResult
} from 'aws-lambda'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { URL } from 'url'

// Auth0 configuration
const issuer = 'https://dev-pzam8f6wltxjvgap.us.auth0.com/'
const audience = 'https://todo-api.dev'

// Construct JWKS URI correctly to avoid double slash
const jwksUri = issuer.endsWith('/')
  ? `${issuer}.well-known/jwks.json`
  : `${issuer}/.well-known/jwks.json`

const JWKS = createRemoteJWKSet(new URL(jwksUri))

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const token = getToken(event.authorizationToken)

    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience
    })

    return {
      principalId: payload.sub as string,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.error('Authorization error:', e)

    return {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function getToken(authHeader: string | undefined): string {
  if (!authHeader) throw new Error('No authorization header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authorization header')

  return authHeader.split(' ')[1]
}

