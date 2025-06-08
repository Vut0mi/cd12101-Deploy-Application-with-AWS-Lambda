import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { createTodo } from "../businessLogic/todos";
import { getUserId } from "../utils";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing createTodo event", event);

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const newTodo: CreateTodoRequest = JSON.parse(event.body);

    if (!newTodo.name || !newTodo.dueDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'name' or 'dueDate' in request body" }),
      };
    }

    const userId = getUserId(event);
    const item = await createTodo(newTodo, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({ item }),
    };
  } catch (error) {
    console.error("Error creating TODO:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create TODO" }),
    };
  }
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*",
    credentials: true,
  })
);

