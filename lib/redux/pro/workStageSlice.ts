import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type WorkStageState = {
  lastScan: string | null
  workStage: string | null
}

const initialWorkStageState: WorkStageState = {
  lastScan: null,
  workStage: null,
}

const workStageSlice = createSlice({
  name: 'workStage',
  initialState: initialWorkStageState,
  reducers: {
    updateLastScan: (state, action: PayloadAction<string>) => {
      state.lastScan = action.payload
    },
    updateWorkStage: (state, action: PayloadAction<string>) => {
      state.workStage = action.payload
    },
  },
})

export const { updateLastScan, updateWorkStage } = workStageSlice.actions
export default workStageSlice.reducer
