import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getTodo as bizGetTodo } from "../businessLogic/todos";
import { getUserId } from "../utils/getUserId";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters?.todoId;
  const userId = getUserId(event);

  console.log("Received getTodo event", {
    pathParameters: event.pathParameters,
    todoId,
    userId,
  });

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" }),
    };
  }

  try {
    const item = await bizGetTodo(todoId, userId);

    if (!item) {
      console.warn(`Todo not found: todoId=${todoId}, userId=${userId}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Todo not found" }),
      };
    }

    console.log("Todo fetched successfully:", item);

    return {
      statusCode: 200,
      body: JSON.stringify({ item }),
    };
  } catch (err) {
    console.error("Error fetching todo", {
      error: err,
      todoId,
      userId,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch todo" }),
    };
  }
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*", // Replace with specific origin in production
    credentials: true,
  })
);

