import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { getTodos } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing getTodos event for request:", event);

  try {
    const userId = getUserId(event);
    const items = await getTodos(userId);

    console.log(`Fetched ${items.length} todos for userId=${userId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ items }),
    };
  } catch (error) {
    console.error("Error fetching todos:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch todos" }),
    };
  }
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*", // specify frontend URL if needed for better security
    credentials: true,
  })
);

