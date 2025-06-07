// src/dataLayer/todosAccess.ts

import AWSXRay from "aws-xray-sdk-core"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Wrap AWS SDK v3 clients with X-Ray
const xrayWrappedDynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}))
const docClient = DynamoDBDocumentClient.from(xrayWrappedDynamoClient)

const xrayWrappedS3Client = AWSXRay.captureAWSv3Client(new S3Client({}))

const bucketName = process.env.ATTACHMENT_S3_BUCKET!
const todosTable = process.env.TODOS_TABLE!

export class TodosAccess {
  async getTodos(userId: string) {
    const command = new QueryCommand({
      TableName: todosTable,
      KeyConditionExpression: "partitionKey = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })

    const result = await docClient.send(command)
    return result.Items
  }

  async getTodo(todoId: string, userId: string) {
    const command = new GetCommand({
      TableName: todosTable,
      Key: {
        partitionKey: userId,
        sortKey: todoId,
      },
    })

    const result = await docClient.send(command)
    return result.Item
  }

  async createTodo(todo: any) {
    const command = new PutCommand({
      TableName: todosTable,
      Item: todo,
    })
    await docClient.send(command)
    return todo
  }

  async updateTodo(todoId: string, userId: string, updateRequest: any) {
    const command = new UpdateCommand({
      TableName: todosTable,
      Key: {
        partitionKey: userId,
        sortKey: todoId,
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": updateRequest.name,
        ":dueDate": updateRequest.dueDate,
        ":done": updateRequest.done,
      },
    })

    await docClient.send(command)
  }

  async deleteTodo(todoId: string, userId: string) {
    const command = new DeleteCommand({
      TableName: todosTable,
      Key: {
        partitionKey: userId,
        sortKey: todoId,
      },
    })
    await docClient.send(command)
  }

  async generateUploadUrl(todoId: string, userId: string) {
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId,
    })

    const url = await getSignedUrl(xrayWrappedS3Client, putCommand, {
      expiresIn: 300,
    })

    const updateCommand = new UpdateCommand({
      TableName: todosTable,
      Key: {
        partitionKey: userId,
        sortKey: todoId,
      },
      UpdateExpression: "set attachmentUrl = :a",
      ExpressionAttributeValues: {
        ":a": `https://${bucketName}.s3.amazonaws.com/${todoId}`,
      },
    })

    await docClient.send(updateCommand)
    return url
  }
}

