// src/api/todos-api.js
import Axios from 'axios'

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT

// GET /todos
export async function getTodos(idToken) {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  console.log('Todos:', response.data)
  return response.data.items
}

// GET /todos/{todoId}
export async function getTodo(idToken, todoId) {
  console.log(`Fetching single todo (${todoId})`)

  const response = await Axios.get(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  console.log('Todo:', response.data)
  return response.data.item
}

// POST /todos
export async function createTodo(idToken, newTodo) {
  const response = await Axios.post(
    `${apiEndpoint}/todos`,
    JSON.stringify(newTodo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.item
}

// PATCH /todos/{todoId}
export async function patchTodo(idToken, todoId, updatedTodo) {
  await Axios.patch(
    `${apiEndpoint}/todos/${todoId}`,
    JSON.stringify(updatedTodo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

// DELETE /todos/{todoId}
export async function deleteTodo(idToken, todoId) {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

// POST /todos/{todoId}/attachment
export async function getUploadUrl(idToken, todoId) {
  const response = await Axios.post(
    `${apiEndpoint}/todos/${todoId}/attachment`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

// PUT to pre-signed URL with metadata
export async function uploadFile(uploadUrl, file, userId) {
  await Axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    }
  })
}

