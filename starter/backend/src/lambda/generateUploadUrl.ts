import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import middy from "@middy/core"
import httpCors from "@middy/http-cors"

import { generateUploadUrl, getTodo } from "../businessLogic/todos"
import { getUserId } from "../utils"

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing generateUploadUrl event", event)

  const todoId = event.pathParameters?.todoId
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" }),
    }
  }

  const userId = getUserId(event)
  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized: missing user ID" }),
    }
  }

  let contentType: string | undefined
  try {
    const body = JSON.parse(event.body || "{}")
    contentType = body.contentType
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    }
  }

  if (!contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing contentType in request body" }),
    }
  }

  try {
    const todo = await getTodo(todoId, userId)
    if (!todo) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Todo with ID ${todoId} not found for user` }),
      }
    }

    const uploadUrl = await generateUploadUrl(todoId, userId, contentType)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    }
  } catch (error) {
    console.error(
      `Error generating upload URL for todoId=${todoId}, userId=${userId}:`,
      error
    )
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not generate upload URL" }),
    }
  }
}

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "http://localhost:3000", // Change this in production
    credentials: true,
  })
)

