//TODO https://nextjs.org/learn/basics/dynamic-routes/page-path-external-data - generete paths based on config file

'use client'

import { useAppSelector } from '@/lib/redux/pro/hooks'

import Status from '../components/Status'
import NumLogIn from '../../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanHydraBatch from '../components/ScanHydraBatch'

export default function OnlyPalletLabel() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)

  return (
    <div>
      {operatorLogged && <Status />}
      {!operatorLogged && <NumLogIn />}
      {!articleLogged && operatorLogged && <ArticleSelector />}
      {articleLogged && operatorLogged && <ScanHydraBatch />}
    </div>
  )
}
