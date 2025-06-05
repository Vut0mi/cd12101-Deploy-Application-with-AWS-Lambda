import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'
import { Button } from 'semantic-ui-react'

export const LogIn = () => {
  const { loginWithRedirect } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect({
      audience: 'https://todo-api.dev', // replace with your actual API audience
      scope: 'read:todos write:todos delete:todo upload:file', // add all needed scopes
      prompt: 'consent' // forces the consent screen
    })
  }

  return (
    <div>
      <h1>Please log in</h1>

      <Button onClick={handleLogin} size="huge" color="olive">
        Log in
      </Button>
    </div>
  )
}

