import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { deleteTodo } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing deleteTodo event", event);

  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" })
    };
  }

  const userId = getUserId(event);
  await deleteTodo(todoId, userId);

  return {
    statusCode: 204,
    body: ""
  };
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: '*',
    credentials: true
  })
);

