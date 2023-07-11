import { configureStore } from '@reduxjs/toolkit'
import operatorReducer from './operatorSlice'
import articleReducer from './articleSlice'
import workStageReducer from './workStageSlice'

type OperatorState = {
  personalNumber: number | null
  name: string | null
  loggedIn: boolean
}

type ArticleState = {
  articleNumber: number | null
  articleName: string | null
}

type WorkStageState = {
  lastScan: string | null
  workStage: number | null
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

const initialWorkStageState: WorkStageState = {
  lastScan: null,
  workStage: null,
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
  return {
    operator: initialOperatorState,
    article: initialArticleState,
    workStage: initialWorkStageState,
  }
}

const store = configureStore({
  reducer: {
    operator: operatorReducer,
    article: articleReducer,
    workStage: workStageReducer,
  },
  preloadedState: preloadedState(),
})

// Middlewares
store.subscribe(() => {
  const state = store.getState()
  const savableState = {
    operator: state.operator,
    article: state.article,
  }

  localStorage.setItem('redux', JSON.stringify(savableState))
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store
