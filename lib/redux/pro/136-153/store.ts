import { configureStore } from '@reduxjs/toolkit'
import operatorReducer from './operatorSlice'
import workplaceReducer from './workplaceSlice'

type OperatorState = {
  personalNumber: number | null
  name: string | null
  loggedIn: boolean
}

type WorkplaceState = {
  isPending: boolean
  onPallet136: number | null
  onPallet153: number | null
  palletSize136: number | null
  palletSize153: number | null
  boxSize136: number | null
  boxSize153: number | null
  isFull136: boolean
  isFull153: boolean
  lastScan: string | null
}

const initialOperatorState: OperatorState = {
  personalNumber: null,
  name: null,
  loggedIn: false,
}

const initialWorkplaceState: WorkplaceState = {
  isPending: false,
  onPallet136: null,
  onPallet153: null,
  palletSize136: null,
  palletSize153: null,
  boxSize136: null,
  boxSize153: null,
  isFull136: false,
  isFull153: false,
  lastScan: null,
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
    workplace: initialWorkplaceState,
  }
}

const store = configureStore({
  reducer: {
    operator: operatorReducer,
    workplace: workplaceReducer,
  },
  preloadedState: preloadedState(),
})

// Middlewares
store.subscribe(() => {
  const state = store.getState()
  const savableState = {
    operator: state.operator,
  }

  localStorage.setItem('redux', JSON.stringify(savableState))
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export default store
