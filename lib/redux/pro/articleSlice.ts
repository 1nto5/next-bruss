import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ArticleState = {
  articleNumber: number | null
  articleName: string | null
}

const initialArticleState: ArticleState = {
  articleNumber: null,
  articleName: null,
}

const articleSlice = createSlice({
  name: 'article',
  initialState: initialArticleState,
  reducers: {
    setArticle: (
      state,
      action: PayloadAction<{
        articleNumber: number
        articleName: string
      }>
    ) => {
      state.articleNumber = action.payload.articleNumber
      state.articleName = action.payload.articleName
    },
    clearArticle: (state) => {
      state.articleNumber = null
      state.articleName = null
    },
  },
})

export const { setArticle, clearArticle } = articleSlice.actions
export default articleSlice.reducer
