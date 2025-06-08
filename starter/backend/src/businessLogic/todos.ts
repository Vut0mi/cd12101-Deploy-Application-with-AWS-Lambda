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
  const items = await todosAccess.getTodos(userId)

  // Normalize to include todoId for frontend compatibility
  return items.map((item) => ({
    ...item,
    todoId: item.sortKey // rename sortKey to todoId for the frontend
  }))
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
  return {
    ...item,
    todoId: item.sortKey // normalize for frontend
  }
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
    partitionKey: userId,
    sortKey: todoId,
    createdAt: new Date().toISOString(),
    name: request.name,
    dueDate: request.dueDate,
    done: false
  }

  const savedItem = await todosAccess.createTodo(newItem)
  return {
    ...savedItem,
    todoId: savedItem.sortKey
  }
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
 * Generate a pre-signed URL to upload an attachment.
 * Takes contentType and updates the TODO's attachmentUrl.
 */
export async function generateUploadUrl(
  todoId: string,
  userId: string,
  contentType: string
): Promise<string> {
  return await todosAccess.generateUploadUrl(todoId, userId, contentType)
}

/**
 * Update a TODO's attachmentUrl directly.
 * Used if you want to call this from a separate Lambda.
 */
export async function updateTodoAttachmentUrl(
  todoId: string,
  userId: string,
  attachmentUrl: string
) {
  return await todosAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl)
}

