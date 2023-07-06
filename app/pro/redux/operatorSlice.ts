// store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  persNum: number | null
  name: string | null
  loggedIn: boolean
}

const initialState: UserState = {
  persNum: null,
  name: null,
  loggedIn: false,
}

const userSlice = createSlice({
  name: 'user',
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

export const { logIn, logOut } = userSlice.actions
export default userSlice.reducer
