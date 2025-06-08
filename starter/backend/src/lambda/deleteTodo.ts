import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { deleteTodo, getTodo } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing deleteTodo event", event);

  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" }),
    };
  }

  const userId = getUserId(event);

  try {
    // Optionally verify the TODO exists
    const existingItem = await getTodo(todoId, userId);
    if (!existingItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Todo with ID ${todoId} not found` }),
      };
    }

    await deleteTodo(todoId, userId);

    return {
      statusCode: 204,
      body: "",
    };
  } catch (err) {
    console.error(`Error deleting todoId=${todoId} for userId=${userId}`, err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete TODO" }),
    };
  }
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*",
    credentials: true,
  })
);

