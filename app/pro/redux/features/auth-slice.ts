import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
  value: AuthState
}

type AuthState = {
  isAuth: boolean
  persNum: string
  uid: string
  isModerator: boolean
}

const initialState = {
  value: {
    isAuth: false,
    persNum: 'test',
    uid: '',
    isModerator: false,
  } as AuthState,
} as InitialState

export const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logOut: () => {
      return initialState
    },
    logIn: (state, action: PayloadAction<string>) => {
      return {
        value: {
          isAuth: true,
          persNum: action.payload,
          uid: 'wdasdasda',
          isModerator: false,
        },
      }
    },
  },
})

export const { logIn, logOut } = auth.actions
export default auth.reducer
