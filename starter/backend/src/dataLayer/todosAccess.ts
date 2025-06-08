import AWSXRay from "aws-xray-sdk-core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.ATTACHMENT_S3_BUCKET!;
const todosTable = process.env.TODOS_TABLE!;

// Wrap clients with AWS X-Ray for tracing
const xrayWrappedDynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const docClient = DynamoDBDocumentClient.from(xrayWrappedDynamoClient);
const xrayWrappedS3Client = AWSXRay.captureAWSv3Client(new S3Client({}));

interface TodoItem {
  partitionKey: string;
  sortKey: string;
  name: string;
  dueDate: string;
  done: boolean;
  attachmentUrl?: string;
}

interface UpdateRequest {
  name: string;
  dueDate: string;
  done: boolean;
}

export class TodosAccess {
  async getTodos(userId: string): Promise<TodoItem[]> {
    try {
      const command = new QueryCommand({
        TableName: todosTable,
        KeyConditionExpression: "partitionKey = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });

      const result = await docClient.send(command);
      return result.Items as TodoItem[];
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem | undefined> {
    try {
      const command = new GetCommand({
        TableName: todosTable,
        Key: {
          partitionKey: userId,
          sortKey: todoId,
        },
      });

      const result = await docClient.send(command);
      return result.Item as TodoItem | undefined;
    } catch (error) {
      console.error(`Error fetching todo ${todoId}:`, error);
      throw error;
    }
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    try {
      const command = new PutCommand({
        TableName: todosTable,
        Item: todo,
      });

      await docClient.send(command);
      return {
        ...todo,
        todoId: todo.sortKey // normalize field name for frontend
      };
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  }

  async updateTodo(todoId: string, userId: string, updateRequest: UpdateRequest): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: todosTable,
        Key: {
          partitionKey: userId,
          sortKey: todoId,
        },
        UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
        ConditionExpression: "attribute_exists(partitionKey) AND attribute_exists(sortKey)",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": updateRequest.name,
          ":dueDate": updateRequest.dueDate,
          ":done": updateRequest.done,
        },
      });

      await docClient.send(command);
    } catch (error) {
      console.error(`Error updating todo ${todoId}:`, error);
      throw error;
    }
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: todosTable,
        Key: {
          partitionKey: userId,
          sortKey: todoId,
        },
      });

      await docClient.send(command);
    } catch (error) {
      console.error(`Error deleting todo ${todoId}:`, error);
      throw error;
    }
  }

  async generateUploadUrl(todoId: string, userId: string, contentType: string): Promise<string> {
    try {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: todoId,
        ContentType: contentType,  // Use the dynamic content type here
      });

      const url = await getSignedUrl(xrayWrappedS3Client, putCommand, {
        expiresIn: 300,
      });

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
      });

      await docClient.send(updateCommand);
      return url;
    } catch (error) {
      console.error(`Error generating upload URL for ${todoId}:`, error);
      throw error;
    }
  }
}

