import { TodosAccess } from "../dataLayer/todosAccess"
import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"
import { v4 as uuidv4 } from "uuid"
import { TodoItem } from "../models/TodoItem"

const todosAccess = new TodosAccess()

/**
 * Fetch all TODOs for a user.
 */
export async function getTodos(userId: string) {
  return todosAccess.getTodos(userId)
}

/**
 * Fetch a single TODO (by todoId + userId).
 * Throws if not found.
 */
export async function getTodo(todoId: string, userId: string) {
  const item = await todosAccess.getTodo(todoId, userId)
  if (!item) {
    throw new Error(`Todo ${todoId} not found for user ${userId}`)
  }
  return item
}

/**
 * Create a new TODO for a user.
 */
export async function createTodo(
  request: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuidv4()

  const newItem: TodoItem = {
    partitionKey: userId,        // userId as the partition key
    sortKey: todoId,             // todoId as the sort key
    createdAt: new Date().toISOString(),
    name: request.name,
    dueDate: request.dueDate,
    done: false
  }

  return await todosAccess.createTodo(newItem)
}

/**
 * Update name/dueDate/done of an existing TODO.
 */
export async function updateTodo(
  todoId: string,
  request: UpdateTodoRequest,
  userId: string
) {
  return await todosAccess.updateTodo(todoId, userId, request)
}

/**
 * Delete a TODO.
 */
export async function deleteTodo(todoId: string, userId: string) {
  return await todosAccess.deleteTodo(todoId, userId)
}

/**
 * Generate a pre‐signed URL to upload an attachment, then update the TODO item’s attachmentUrl.
 */
export async function generateUploadUrl(todoId: string, userId: string) {
  return await todosAccess.generateUploadUrl(todoId, userId)
}

