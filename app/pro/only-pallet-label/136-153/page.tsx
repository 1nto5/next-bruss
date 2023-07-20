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
  updateBoxSize,
} from '@/lib/redux/pro/workplaceSlice'
import Status from '../components/Status'
import NumLogIn from '../../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanHydraQr from '../components/ScanHydraQr'
import ScanPalletQr from '../components/ScanPalletQr'
import PrintPalletLabel from '../../components/PrintPalletLabel'

import { countOnPallet, getPalletSize, getBoxSize } from '../actions'

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
          const onPallet = await countOnPallet(pathWorkplace, articleLogged)
          dispatch(updateOnPallet(onPallet))
          const palletSize = await getPalletSize(pathWorkplace, articleLogged)
          dispatch(updatePalletSize(palletSize))
          if (onPallet >= palletSize) {
            dispatch(toggleIsFull())
          }
          const boxSize = await getBoxSize(pathWorkplace, articleLogged)
          dispatch(updateBoxSize(boxSize))
        }
      } catch (error) {
        console.error(
          'Failed to fetch quantity on a pallet, pallet size or box size:',
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
      {articleLogged && operatorLogged && !isPending && (
        <>
          {isFull ? (
            <>
              <ScanPalletQr workplace={pathWorkplace} />
              <PrintPalletLabel />
            </>
          ) : (
            <ScanHydraQr workplace={pathWorkplace} />
          )}
        </>
      )}
    </div>
  )
}
