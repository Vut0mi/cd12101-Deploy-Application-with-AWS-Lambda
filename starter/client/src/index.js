import { Auth0Provider } from '@auth0/auth0-react'
import React from 'react'
import ReactDOM from 'react-dom'
import 'semantic-ui-css/semantic.min.css'
import App from './App'
import './index.css'

const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
const audience = "https://todo-api.dev" // <-- Replace with your Auth0 API Identifier

ReactDOM.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    redirectUri={window.location.origin}
    audience={audience}
    scope="openid profile email read:todo update:todos write:todos delete:todo"
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
)

