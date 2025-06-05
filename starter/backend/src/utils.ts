import { APIGatewayProxyEvent } from "aws-lambda";
import { decodeJwt } from "jose";

export function getUserId(event: APIGatewayProxyEvent): string {
  const authHeader = event.headers.Authorization;
  if (!authHeader) throw new Error("No Authorization header");

  const token = authHeader.split(" ")[1];
  const decoded = decodeJwt(token);
  
  // decoded is type Record<string, any>, so access sub safely:
  if (!decoded.sub) throw new Error("No sub claim in token");
  
  return decoded.sub as string;
}

