import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";

import { generateUploadUrl } from "../../businessLogic/todos";
import { getUserId } from "../utils";

const baseHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing generateUploadUrl event", event);

  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing todoId in path" })
    };
  }

  const userId = getUserId(event);
  const uploadUrl = await generateUploadUrl(todoId, userId);

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  };
};

export const handler = middy(baseHandler).use(
  httpCors({
    origin: '*',
    credentials: true
  })
);

