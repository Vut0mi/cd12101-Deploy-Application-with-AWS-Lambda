import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { createTodo } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing createTodo event", event);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing request body" })
    };
  }

  const newTodo = JSON.parse(event.body);
  const userId = getUserId(event);
  const item = await createTodo(newTodo, userId);

  return {
    statusCode: 201,
    body: JSON.stringify({ item })
  };
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: '*',
    credentials: true
  })
);

