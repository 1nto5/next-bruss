'use client'

import { useAppSelector } from '../../redux/hooks'

import Status from '../components/Status'
import NumLogIn from '../../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanHydraBatch from '../components/ScanHydraBatch'

export default function OnlyPalletLabel() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.artNum)

  return (
    <div>
      {operatorLogged && <Status />}
      {!operatorLogged && <NumLogIn />}
      {!articleLogged && operatorLogged && <ArticleSelector />}
      {articleLogged && operatorLogged && <ScanHydraBatch />}
    </div>
  )
}
