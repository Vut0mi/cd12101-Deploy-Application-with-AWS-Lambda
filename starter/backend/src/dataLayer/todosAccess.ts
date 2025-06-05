// TODO: Data access layer
import * as AWS from "aws-sdk";
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ signatureVersion: "v4" });

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const todosTable = process.env.TODOS_TABLE;

export class TodosAccess {
  async getTodos(userId: string) {
    const result = await docClient
      .query({
        TableName: todosTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
      .promise();

    return result.Items;
  }

  async createTodo(todo) {
    await docClient.put({ TableName: todosTable, Item: todo }).promise();
    return todo;
  }

  async updateTodo(todoId, userId, updateRequest) {
    await docClient
      .update({
        TableName: todosTable,
        Key: { userId, todoId },
        UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: {
          ":name": updateRequest.name,
          ":dueDate": updateRequest.dueDate,
          ":done": updateRequest.done,
        },
      })
      .promise();
  }

  async deleteTodo(todoId, userId) {
    await docClient.delete({ TableName: todosTable, Key: { userId, todoId } }).promise();
  }

  async generateUploadUrl(todoId, userId) {
    const url = s3.getSignedUrl("putObject", {
      Bucket: bucketName,
      Key: todoId,
      Expires: 300,
    });

    await docClient
      .update({
        TableName: todosTable,
        Key: { userId, todoId },
        UpdateExpression: "set attachmentUrl = :a",
        ExpressionAttributeValues: {
          ":a": `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        },
      })
      .promise();

    return url;
  }
}
