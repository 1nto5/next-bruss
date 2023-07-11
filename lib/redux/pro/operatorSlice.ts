import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OperatorState {
  personalNumber: number | null
  name: string | null
  loggedIn: boolean
}

const initialState: OperatorState = {
  personalNumber: null,
  name: null,
  loggedIn: false,
}

const operatorSlice = createSlice({
  name: 'operator',
  initialState,
  reducers: {
    logIn: (
      state,
      action: PayloadAction<{ personalNumber: number; name: string }>
    ) => {
      state.personalNumber = action.payload.personalNumber
      state.name = action.payload.name
      state.loggedIn = true
    },
    logOut: (state) => {
      state.personalNumber = null
      state.name = null
      state.loggedIn = false
    },
  },
})

export const { logIn, logOut } = operatorSlice.actions
export default operatorSlice.reducer
