// TODO: Business logic for TODO operations
import { TodosAccess } from "../dataLayer/todosAccess";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { v4 as uuidv4 } from "uuid";

const todosAccess = new TodosAccess();

export async function getTodos(userId: string) {
  return todosAccess.getTodos(userId);
}

export async function createTodo(
  request: CreateTodoRequest,
  userId: string
) {
  const todoId = uuidv4();
  return await todosAccess.createTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: request.name,
    dueDate: request.dueDate,
    done: false,
  });
}

export async function updateTodo(
  todoId: string,
  request: UpdateTodoRequest,
  userId: string
) {
  return await todosAccess.updateTodo(todoId, userId, request);
}

export async function deleteTodo(todoId: string, userId: string) {
  return await todosAccess.deleteTodo(todoId, userId);
}

export async function generateUploadUrl(todoId: string, userId: string) {
  return await todosAccess.generateUploadUrl(todoId, userId);
}
