import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type WorkplaceStatusState = {
  isPending: boolean
  onPallet: number | null
  palletSize: number | null
  isFull: boolean
  lastScan: string | null
}

const initialWorkplaceStatusState: WorkplaceStatusState = {
  isPending: false,
  onPallet: null,
  palletSize: null,
  isFull: false,
  lastScan: null,
}

const workplaceSlice = createSlice({
  name: 'workplaceStatus',
  initialState: initialWorkplaceStatusState,
  reducers: {
    togglePending: (state) => {
      state.isPending = !state.isPending
    },
    updateOnPallet: (state, action: PayloadAction<number>) => {
      state.onPallet = action.payload
    },
    updatePalletSize: (state, action: PayloadAction<number>) => {
      state.palletSize = action.payload
    },
    toggleIsFull: (state) => {
      state.isFull = !state.isFull
    },
    updateLastScan: (state, action: PayloadAction<string>) => {
      state.lastScan = action.payload
    },
  },
})

export const {
  togglePending,
  updateOnPallet,
  updatePalletSize,
  toggleIsFull,
  updateLastScan,
} = workplaceSlice.actions
export default workplaceSlice.reducer
