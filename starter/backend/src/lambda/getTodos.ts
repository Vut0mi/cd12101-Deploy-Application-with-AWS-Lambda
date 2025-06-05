import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { getTodos } from "../../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing getTodos event", event);

  try {
    const userId = getUserId(event);
    const items = await getTodos(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ items })
    };
  } catch (error) {
    console.error("Error fetching todos", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch todos" })
    };
  }
};

// Middy wrapper with CORS
export const handler = middy(baseHandler).use(
  httpCors({
    origin: '*', // or 'http://localhost:3000' for specific origin
    credentials: true
  })
);

