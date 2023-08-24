import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type WorkplaceStatusState = {
  isPending: boolean
  inBox: number | null
  onPallet: number | null
  palletSize: number | null
  boxSize: number | null
  isFullBox: boolean
  isFullPallet: boolean
  lastScan: string | null
}

const initialWorkplaceStatusState: WorkplaceStatusState = {
  isPending: false,
  inBox: null,
  onPallet: null,
  palletSize: null,
  boxSize: null,
  isFullBox: false,
  isFullPallet: false,
  lastScan: null,
}

const workplaceSlice = createSlice({
  name: 'workplaceStatus',
  initialState: initialWorkplaceStatusState,
  reducers: {
    togglePending: (state, action: PayloadAction<boolean>) => {
      state.isPending = action.payload
    },
    updateInBox: (state, action: PayloadAction<number>) => {
      state.inBox = action.payload
    },
    updateOnPallet: (state, action: PayloadAction<number>) => {
      state.onPallet = action.payload
    },
    updatePalletSize: (state, action: PayloadAction<number>) => {
      state.palletSize = action.payload
    },
    updateBoxSize: (state, action: PayloadAction<number>) => {
      state.boxSize = action.payload
    },
    toggleIsFullBox: (state) => {
      state.isFullBox = !state.isFullBox
    },
    toggleIsFullPallet: (state) => {
      state.isFullPallet = !state.isFullPallet
    },
    updateLastScan: (state, action: PayloadAction<string>) => {
      state.lastScan = action.payload
    },
  },
})

export const {
  togglePending,
  updateInBox,
  updateOnPallet,
  updatePalletSize,
  updateBoxSize,
  toggleIsFullBox,
  toggleIsFullPallet,
  updateLastScan,
} = workplaceSlice.actions
export default workplaceSlice.reducer
