import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ArticleState = {
  artNum: number | null
  artName: string | null
  palletSize: number | null
}

const initialArticleState: ArticleState = {
  artNum: null,
  artName: null,
  palletSize: null,
}

const articleSlice = createSlice({
  name: 'article',
  initialState: initialArticleState,
  reducers: {
    setArticle: (
      state,
      action: PayloadAction<{
        artNum: number
        artName: string
        palletSize: number
      }>
    ) => {
      state.artNum = action.payload.artNum
      state.artName = action.payload.artName
      state.palletSize = action.payload.palletSize
    },
    clearArticle: (state) => {
      state.artNum = null
      state.artName = null
      state.palletSize = null
    },
  },
})

export const { setArticle, clearArticle } = articleSlice.actions
export default articleSlice.reducer
