import React from 'react'
import { Provider } from 'react-redux'
import App from './components/App'
import store from './store'

function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

export default Root
