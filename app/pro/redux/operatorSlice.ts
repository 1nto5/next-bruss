import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OperatorState {
  persNum: number | null
  name: string | null
  loggedIn: boolean
}

const initialState: OperatorState = {
  persNum: null,
  name: null,
  loggedIn: false,
}

const operatorSlice = createSlice({
  name: 'operator',
  initialState,
  reducers: {
    logIn: (
      state,
      action: PayloadAction<{ persNum: number; name: string }>
    ) => {
      state.persNum = action.payload.persNum
      state.name = action.payload.name
      state.loggedIn = true
    },
    logOut: (state) => {
      state.persNum = null
      state.name = null
      state.loggedIn = false
    },
  },
})

export const { logIn, logOut } = operatorSlice.actions
export default operatorSlice.reducer
