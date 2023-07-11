import { configureStore } from '@reduxjs/toolkit'
import operatorReducer from './operatorSlice'
import articleReducer from './articleSlice' // Import the article reducer

type OperatorState = {
  personalNumber: number | null
  name: string | null
  loggedIn: boolean
}

type ArticleState = {
  articleNumber: number | null
  articleName: string | null
}

const initialOperatorState: OperatorState = {
  personalNumber: null,
  name: null,
  loggedIn: false,
}

const initialArticleState: ArticleState = {
  articleNumber: null,
  articleName: null,
}

const preloadedState = () => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('redux')
    if (savedState) {
      // Parse the state from local storage and return it
      return JSON.parse(savedState)
    }
  }

  // If there's no saved state, return the initial state
  return { operator: initialOperatorState, article: initialArticleState }
}

const store = configureStore({
  reducer: {
    operator: operatorReducer,
    article: articleReducer,
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
