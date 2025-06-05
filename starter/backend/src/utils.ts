import { APIGatewayProxyEvent } from "aws-lambda";
import { decode } from "jsonwebtoken";

export function getUserId(event: APIGatewayProxyEvent): string {
  const authHeader = event.headers.Authorization;
  const token = authHeader.split(" ")[1];
  const decoded = decode(token);
  return decoded.sub;
}
