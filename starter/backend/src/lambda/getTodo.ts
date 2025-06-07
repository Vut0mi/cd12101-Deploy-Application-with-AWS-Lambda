// src/lambda/getTodo.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getTodo as bizGetTodo } from "../businessLogic/todos"
import { getUserId } from "../utils/getUserId"
import middy from "@middy/core"
import httpCors from "@middy/http-cors"

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing getTodo event", event)

  const todoId = event.pathParameters?.todoId
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" }),
    }
  }

  const userId = getUserId(event)
  try {
    const item = await bizGetTodo(todoId, userId)
    return {
      statusCode: 200,
      body: JSON.stringify({ item }),
    }
  } catch (err) {
    console.error("Error fetching single todo", err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch todo" }),
    }
  }
}

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*",
    credentials: true,
  })
)

