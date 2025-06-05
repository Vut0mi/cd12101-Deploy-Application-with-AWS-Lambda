import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({ signatureVersion: "v4" });

const bucketName = process.env.ATTACHMENT_S3_BUCKET!;
const todosTable = process.env.TODOS_TABLE!;

export class TodosAccess {
  async getTodos(userId: string) {
    const command = new QueryCommand({
      TableName: todosTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    });
    const result = await docClient.send(command);
    return result.Items;
  }

  async createTodo(todo: any) {
    const command = new PutCommand({
      TableName: todosTable,
      Item: todo,
    });
    await docClient.send(command);
    return todo;
  }

  async updateTodo(todoId: string, userId: string, updateRequest: any) {
    const command = new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: {
        ":name": updateRequest.name,
        ":dueDate": updateRequest.dueDate,
        ":done": updateRequest.done,
      },
    });
    await docClient.send(command);
  }

  async deleteTodo(todoId: string, userId: string) {
    const command = new DeleteCommand({
      TableName: todosTable,
      Key: { userId, todoId },
    });
    await docClient.send(command);
  }

  async generateUploadUrl(todoId: string, userId: string) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Update the todo item with the attachment URL
    const updateCommand = new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl = :a",
      ExpressionAttributeValues: {
        ":a": `https://${bucketName}.s3.amazonaws.com/${todoId}`,
      },
    });
    await docClient.send(updateCommand);

    return url;
  }
}

