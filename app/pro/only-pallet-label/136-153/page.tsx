// "client" module should be imported correctly based on your directory structure
'use client'

import { useAppSelector } from '@/lib/redux/pro/hooks'
import { useDispatch } from 'react-redux'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import {
  togglePending,
  toggleIsFull,
  updateOnPallet,
  updatePalletSize,
} from '@/lib/redux/pro/workplaceSlice'
import Status from '../components/Status'
import NumLogIn from '../../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanHydraBatch from '../components/ScanHydraBatch'

import { countOnPallet, getPalletSize } from '../actions'

export default function OnlyPalletLabel() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)
  const pathWorkplace = usePathname().split('/').pop() || ''
  const lastScan = useAppSelector((state) => state.workplace.lastScan)

  const dispatch = useDispatch()

  const isFull = useAppSelector((state) => state.workplace.isFull)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    dispatch(togglePending(isPending))
  }, [dispatch, isPending])

  useEffect(() => {
    startTransition(async () => {
      try {
        if (articleLogged) {
          const onPalletCount = await countOnPallet(
            pathWorkplace,
            articleLogged
          )
          dispatch(updateOnPallet(onPalletCount))
          const palletSizeCount = await getPalletSize(
            pathWorkplace,
            articleLogged
          )
          dispatch(updatePalletSize(palletSizeCount))
          if (onPalletCount >= palletSizeCount) {
            dispatch(toggleIsFull())
          }
        }
      } catch (error) {
        console.error(
          'Failed to fetch quantity on a pallet and pallet size:',
          error
        )
      }
    })
  }, [articleLogged, dispatch, lastScan, pathWorkplace])

  return (
    <div>
      {operatorLogged && <Status />}
      {!operatorLogged && <NumLogIn />}
      {!articleLogged && operatorLogged && (
        <ArticleSelector workplace={pathWorkplace} />
      )}
      {articleLogged &&
        operatorLogged &&
        !isFull &&
        (isPending ? 'laading' : <ScanHydraBatch workplace={pathWorkplace} />)}
    </div>
  )
}
