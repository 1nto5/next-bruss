// 'use client'

// import { useAppSelector } from '../pro/redux/hooks'
// import { useSelector } from 'react-redux'

// export const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
// export const articleLogged = useAppSelector((state) => state.article.artNum)

// export const operNameSelector = useSelector(
//   (state: { operator: { name: string; persNum: number } }) =>
//     state.operator.name
// )

// export const operNumSelector = useSelector(
//   (state: { operator: { name: string; persNum: number } }) =>
//     state.operator.persNum
// )

// export const artNumSelector = useSelector(
//   (state: { article: { artNum: number; artName: string } }) =>
//     state.article.artNum
// )

// export const artNameSelector = useSelector(
//   (state: { article: { artNum: number; artName: string } }) =>
//     state.article.artName
// )

// export const formatOperator = (name: string, persNum: number) => {
//   const parts = name.split(' ')
//   if (parts.length === 2) {
//     return `${parts[0]} ${parts[1].charAt(0)}. (${persNum})`
//   }
//   return name
// }
