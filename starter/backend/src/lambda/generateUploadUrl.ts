import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { generateUploadUrl } from "../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing generateUploadUrl event", event);

  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing request body" }),
    };
  }

  let contentType: string;
  try {
    const body = JSON.parse(event.body);
    contentType = body.contentType;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing contentType in request body" }),
    };
  }

  const userId = getUserId(event);

  try {
    const uploadUrl = await generateUploadUrl(todoId, userId, contentType);
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not generate upload URL" }),
    };
  }
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: "*",
    credentials: true,
  })
);

