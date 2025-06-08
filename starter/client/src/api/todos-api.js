// src/api/todos-api.js
import Axios from 'axios'

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT

// GET /todos
export async function getTodos(idToken) {
  try {
    const response = await Axios.get(`${apiEndpoint}/todos`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })
    return response.data.items
  } catch (error) {
    console.error('Error fetching todos:', error)
    throw error
  }
}

// GET /todos/{todoId}
export async function getTodo(idToken, todoId) {
  try {
    const response = await Axios.get(`${apiEndpoint}/todos/${todoId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })
    return response.data.item
  } catch (error) {
    console.error(`Error fetching todo ${todoId}:`, error)
    throw error
  }
}

// POST /todos
export async function createTodo(idToken, newTodo) {
  try {
    const response = await Axios.post(
      `${apiEndpoint}/todos`,
      newTodo,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      }
    )
    return response.data.item
  } catch (error) {
    console.error('Error creating todo:', error)
    throw error
  }
}

// PATCH /todos/{todoId}
export async function patchTodo(idToken, todoId, updatedTodo) {
  try {
    await Axios.patch(
      `${apiEndpoint}/todos/${todoId}`,
      updatedTodo,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      }
    )
  } catch (error) {
    console.error(`Error updating todo ${todoId}:`, error)
    throw error
  }
}

// DELETE /todos/{todoId}
export async function deleteTodo(idToken, todoId) {
  try {
    await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    })
  } catch (error) {
    console.error(`Error deleting todo ${todoId}:`, error)
    throw error
  }
}

// POST /todos/{todoId}/attachment to get pre-signed S3 URL
export async function getUploadUrl(idToken, todoId, contentType) {
  try {
    const response = await Axios.post(
      `${apiEndpoint}/todos/${todoId}/attachment`,
      { contentType },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      }
    )
    return response.data.uploadUrl
  } catch (error) {
    console.error(`Error getting upload URL for todo ${todoId}:`, error)
    throw error
  }
}

// PUT file to S3 using pre-signed URL
export async function uploadFile(uploadUrl, file) {
  try {
    await Axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

