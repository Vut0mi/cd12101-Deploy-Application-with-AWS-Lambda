import Axios from 'axios'

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT

// ... all previous functions unchanged ...

// POST /todos/{todoId}/attachment to get pre-signed URL
export async function getUploadUrl(idToken, todoId, contentType) {
  try {
    const response = await Axios.post(
      `${apiEndpoint}/todos/${todoId}/attachment`,
      { contentType }, // send contentType in request body
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

// PUT to pre-signed S3 URL with file data
export async function uploadFile(uploadUrl, file) {
  try {
    await Axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

