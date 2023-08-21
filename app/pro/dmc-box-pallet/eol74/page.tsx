'use client'

import { useAppSelector } from '@/lib/redux/pro/dmc-box-pallet/hooks'
import { useDispatch } from 'react-redux'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import {
  togglePending,
  toggleIsFull,
  updateOnPallet,
  updatePalletSize,
  updateBoxSize,
} from '@/lib/redux/pro/dmc-box-pallet/workplaceSlice'
import Status from '../components/Status'
import NumLogIn from '../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanHydraQr from '../components/ScanHydraQr'
import ScanPalletQr from '../components/ScanPalletQr'
import PrintPalletLabel from '../components/PrintPalletLabel'

import { countOnPallet, getPalletSize, getBoxSize } from '../actions'

import toast from 'react-hot-toast'

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
          toast.loading('Ładowanie...', { id: 'loading' })
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
        toast.dismiss('loading')
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
      {isPending ? (
        <div></div>
      ) : (
        articleLogged &&
        operatorLogged && (
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
        )
      )}
    </div>
  )
}
