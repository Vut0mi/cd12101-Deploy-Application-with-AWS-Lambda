import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { updateTodo } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing updateTodo event", event);

  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" })
    };
  }

  const updatedTodo = JSON.parse(event.body || "{}");
  const userId = getUserId(event);

  await updateTodo(todoId, updatedTodo, userId);

  return {
    statusCode: 204,
    body: ""
  };
};

// Export with CORS enabled
export const handler = middy(baseHandler).use(
  httpCors({
    origin: '*',
    credentials: true
  })
);

