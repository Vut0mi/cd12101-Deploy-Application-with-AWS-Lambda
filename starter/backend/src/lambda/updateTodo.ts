import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { updateTodo } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing updateTodo event", event);

  // Extract todoId from path parameters
  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" }),
    };
  }

  // Parse update data from request body
  let updateRequest;
  try {
    updateRequest = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("Invalid JSON in request body", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  // Get userId from the authorizer context
  const userId = getUserId(event);

  try {
    await updateTodo(todoId, updateRequest, userId);
    // 204 No Content: successful update with no response body
    return {
      statusCode: 204,
      body: "",
    };
  } catch (err) {
    console.error("Update todo error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update todo" }),
    };
  }
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*",
    credentials: true,
  })
);

