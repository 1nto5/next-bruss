import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type WorkplaceStatusState = {
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

const initialWorkplaceStatusState: WorkplaceStatusState = {
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

const workplaceSlice = createSlice({
  name: 'workplaceStatus',
  initialState: initialWorkplaceStatusState,
  reducers: {
    togglePending: (state, action: PayloadAction<boolean>) => {
      state.isPending = action.payload
    },
    updateOnPallet136: (state, action: PayloadAction<number | null>) => {
      state.onPallet136 = action.payload
    },
    updateOnPallet153: (state, action: PayloadAction<number | null>) => {
      state.onPallet153 = action.payload
    },
    updatePalletSize136: (state, action: PayloadAction<number | null>) => {
      state.palletSize136 = action.payload
    },
    updatePalletSize153: (state, action: PayloadAction<number | null>) => {
      state.palletSize153 = action.payload
    },
    updateBoxSize136: (state, action: PayloadAction<number | null>) => {
      state.boxSize136 = action.payload
    },
    updateBoxSize153: (state, action: PayloadAction<number | null>) => {
      state.boxSize153 = action.payload
    },
    toggleIsFull136: (state) => {
      state.isFull136 = !state.isFull136
    },
    toggleIsFull153: (state) => {
      state.isFull153 = !state.isFull153
    },
    updateLastScan: (state, action: PayloadAction<string | null>) => {
      state.lastScan = action.payload
    },
  },
})

export const {
  togglePending,
  updateOnPallet136,
  updateOnPallet153,
  updatePalletSize136,
  updatePalletSize153,
  updateBoxSize136,
  updateBoxSize153,
  toggleIsFull136,
  toggleIsFull153,
  updateLastScan,
} = workplaceSlice.actions
export default workplaceSlice.reducer
