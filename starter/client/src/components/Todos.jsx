// src/components/Todos.jsx
import update from 'immutability-helper'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react'

import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import { NewTodoInput } from './NewTodoInput'
import { authConfig } from '../config'

export function Todos() {
  const { getAccessTokenSilently } = useAuth0()
  const [todos, setTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTodos() {
      try {
        const accessToken = await getAccessTokenSilently({
          audience: authConfig.audience,
          scope: 'read:todos'
        })
        const todosData = await getTodos(accessToken)

        // Normalize todoId field if missing or named differently
        const normalizedTodos = todosData.map(todo => ({
          ...todo,
          todoId: todo.todoId || todo.id || todo.todoID
        }))

        setTodos(normalizedTodos)
        setLoadingTodos(false)
      } catch (e) {
        alert(`Failed to fetch todos: ${e.message}`)
      }
    }
    fetchTodos()
  }, [getAccessTokenSilently])

  async function onTodoDelete(todoId) {
    try {
      console.log('Deleting todoId:', todoId)
      const accessToken = await getAccessTokenSilently({
        audience: authConfig.audience,
        scope: 'delete:todo'
      })
      await deleteTodo(accessToken, todoId)

      // Refetch todos after deletion
      const todosData = await getTodos(accessToken)
      const normalizedTodos = todosData.map(todo => ({
        ...todo,
        todoId: todo.todoId || todo.id || todo.todoID
      }))
      setTodos(normalizedTodos)
    } catch (e) {
      alert(`Todo deletion failed: ${e.message}`)
    }
  }

  async function onTodoCheck(pos) {
    try {
      const todo = todos[pos]
      const accessToken = await getAccessTokenSilently({
        audience: authConfig.audience,
        scope: 'update:todos'
      })
      await patchTodo(accessToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      setTodos(
        update(todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      )
    } catch (e) {
      alert(`Todo update failed: ${e.message}`)
    }
  }

  function onEditButtonClick(todoId, todo) {
    const idToUse = todoId || todo.id || todo.todoID
    if (!idToUse) {
      alert("Cannot edit: todoId is missing")
      console.error("Missing todoId for todo:", todo)
      return
    }
    navigate(`/todos/${idToUse}/edit`)
  }

  function renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  function renderTodosList() {
    return (
      <Grid padded>
        {todos.map((todo, pos) => (
          <Grid.Row key={todo.todoId || pos}>
            <Grid.Column width={1} verticalAlign="middle">
              <Checkbox onChange={() => onTodoCheck(pos)} checked={todo.done} />
            </Grid.Column>
            <Grid.Column width={10} verticalAlign="middle">
              {todo.name}
            </Grid.Column>
            <Grid.Column width={3} floated="right">
              {new Date(todo.dueDate).toLocaleDateString()}
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button icon color="blue" onClick={() => onEditButtonClick(todo.todoId, todo)}>
                <Icon name="pencil" />
              </Button>
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button
                icon
                color="red"
                onClick={() => {
                  console.log('Delete button clicked for todoId:', todo.todoId)
                  onTodoDelete(todo.todoId)
                }}
              >
                <Icon name="delete" />
              </Button>
            </Grid.Column>
            {todo.attachmentUrl && (
              <Grid.Column width={16}>
                <Image src={todo.attachmentUrl} size="small" wrapped />
              </Grid.Column>
            )}
            <Grid.Column width={16}>
              <Divider />
            </Grid.Column>
          </Grid.Row>
        ))}
      </Grid>
    )
  }

  function renderTodos() {
    if (loadingTodos) {
      return renderLoading()
    }
    return renderTodosList()
  }

  return (
    <div>
      <Header as="h1">TODOs</Header>
      <NewTodoInput onNewTodo={(newTodo) => setTodos([...todos, newTodo])} />
      {renderTodos()}
    </div>
  )
}

