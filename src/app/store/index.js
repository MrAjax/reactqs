import { createStore } from 'redux'
import reducer from '../reducer'

const store = createStore(reducer)

if (__DEV__) {
  window.store = store
}

export default store
