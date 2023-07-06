import { configureStore } from '@reduxjs/toolkit'
import operatorReducer from './operatorSlice'
import checkUser from '../utils/checkUser'

type OperatorState = {
  persNum: number | null
  name: string | null
  loggedIn: boolean
}

const initialState: OperatorState = {
  persNum: null,
  name: null,
  loggedIn: false,
}

const preloadedState = (): { user: OperatorState } => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('redux')
    if (savedState) {
      const { user } = JSON.parse(savedState)
      const operator = checkUser(user.persNum)
      if (operator) {
        user.name = operator.name
      }
      return { user }
    }
  }
  return { user: initialState }
}

const store = configureStore({
  reducer: {
    user: operatorReducer,
  },
  preloadedState: preloadedState(),
})

// Middlewares
store.subscribe(() => {
  localStorage.setItem('redux', JSON.stringify(store.getState()))
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store
