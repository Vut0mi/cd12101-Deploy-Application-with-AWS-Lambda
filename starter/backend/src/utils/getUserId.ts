import { APIGatewayProxyEvent } from 'aws-lambda'
import { JwtPayload } from './jwt'
import jwt from 'jsonwebtoken'

/**
 * Get a user ID from a JWT token in an API Gateway event
 * @param event API Gateway event
 * @returns userId extracted from JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authHeader = event.headers.Authorization || event.headers.authorization

  if (!authHeader) {
    throw new Error('No authentication header')
  }

  const token = getToken(authHeader)
  const decodedToken = jwt.decode(token) as JwtPayload

  if (!decodedToken || typeof decodedToken === 'string' || !decodedToken.sub) {
    throw new Error('Invalid token')
  }

  return decodedToken.sub
}

function getToken(authHeader: string): string {
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  return authHeader.split(' ')[1]
}

