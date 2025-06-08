// src/components/EditTodo.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Button, Loader, Message, Divider } from 'semantic-ui-react'
import { useAuth0 } from '@auth0/auth0-react'
import { getTodo, patchTodo, getUploadUrl, uploadFile } from '../api/todos-api'
import { authConfig } from '../config'

const UploadState = {
  NoUpload: 'NoUpload',
  FetchingPresignedUrl: 'FetchingPresignedUrl',
  UploadingFile: 'UploadingFile'
}

export function EditTodo() {
  const { todoId } = useParams()
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()

  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loadingTodo, setLoadingTodo] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const [file, setFile] = useState(null)
  const [uploadState, setUploadState] = useState(UploadState.NoUpload)

  useEffect(() => {
    async function loadTodo() {
      if (!todoId) return
      try {
        const accessToken = await getAccessTokenSilently({
          audience: authConfig.audience,
          scope: 'read:todos'
        })
        const todoItem = await getTodo(accessToken, todoId)
        setName(todoItem.name)
        setDueDate(todoItem.dueDate)
      } catch (err) {
        console.error('Could not load todo', err)
        setErrorMsg('Failed to load the todo item.')
      } finally {
        setLoadingTodo(false)
      }
    }
    loadTodo()
  }, [todoId, getAccessTokenSilently])

  async function handleSaveChanges(event) {
    event.preventDefault()
    if (!todoId) return

    setSaving(true)
    setErrorMsg(null)

    try {
      const accessToken = await getAccessTokenSilently({
        audience: authConfig.audience,
        scope: 'update:todos'
      })
      await patchTodo(accessToken, todoId, {
        name: name.trim(),
        dueDate,
        done: false
      })
      navigate('/')
    } catch (err) {
      console.error('Error saving todo', err)
      setErrorMsg('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  function handleFileChange(evt) {
    const files = evt.target.files
    if (!files || files.length === 0) {
      setFile(null)
      return
    }
    setFile(files[0])
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (!todoId) {
      alert('Missing todo ID')
      return
    }

    if (!file) {
      alert('Please select a file first.')
      return
    }

    console.log('Uploading for todoId:', todoId)

    setUploadState(UploadState.FetchingPresignedUrl)
    try {
      const accessToken = await getAccessTokenSilently({
        audience: authConfig.audience,
        scope: 'write:todos'
      })
      const uploadUrl = await getUploadUrl(accessToken, todoId)
      console.log('Received uploadUrl:', uploadUrl)

      if (!uploadUrl || !uploadUrl.startsWith('https://')) {
        throw new Error('Invalid upload URL received from backend')
      }

      setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, file)

      alert('File was successfully uploaded! You can go back to the list to see it.')
    } catch (err) {
      console.error('Upload failed', err)
      alert('Could not upload file: ' + err.message)
    } finally {
      setUploadState(UploadState.NoUpload)
    }
  }

  if (loadingTodo) {
    return <Loader active inline="centered" content="Loading Todo..." />
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h1>Edit Todo</h1>

      {errorMsg && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{errorMsg}</p>
        </Message>
      )}

      <Form onSubmit={handleSaveChanges} loading={saving}>
        <Form.Input
          label="Task Name"
          placeholder="Enter a new task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Form.Input
          type="date"
          label="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <Button primary type="submit">
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Form>

      <Divider />

      <h3>Upload or Change Attachment</h3>
      <Form onSubmit={handleUpload}>
        <Form.Field>
          <label>Select File</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </Form.Field>

        {uploadState === UploadState.FetchingPresignedUrl && <p>Requesting upload URL…</p>}
        {uploadState === UploadState.UploadingFile && <p>Uploading file…</p>}

        <Button
          type="submit"
          primary
          loading={uploadState !== UploadState.NoUpload}
        >
          Upload Image
        </Button>
      </Form>
    </div>
  )
}

