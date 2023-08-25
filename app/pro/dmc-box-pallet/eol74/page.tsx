'use client'

import { useAppSelector } from '@/lib/redux/pro/dmc-box-pallet/hooks'
import { useDispatch } from 'react-redux'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import {
  togglePending,
  toggleIsFullBox,
  toggleIsFullPallet,
  updateInBox,
  updateOnPallet,
  updatePalletSize,
  updateBoxSize,
} from '@/lib/redux/pro/dmc-box-pallet/workplaceSlice'
import Status from '../components/Status'
import NumLogIn from '../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanDmc from '../components/ScanDmc'
import ScanHydraQr from '../components/ScanHydraQr'
import ScanPalletQr from '../components/ScanPalletQr'
import PrintPalletLabel from '../components/PrintPalletLabel'

import {
  countOnPallet,
  getPalletSize,
  getBoxSize,
  countInBox,
} from '@/app/pro/actions'

import toast from 'react-hot-toast'

export default function OnlyPalletLabel() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)
  const pathWorkplace = usePathname().split('/').pop() || ''
  const lastScan = useAppSelector((state) => state.workplace.lastScan)

  const dispatch = useDispatch()

  const isFullBox = useAppSelector((state) => state.workplace.isFullBox)
  const isFullPallet = useAppSelector((state) => state.workplace.isFullPallet)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    dispatch(togglePending(isPending))
  }, [dispatch, isPending])

  useEffect(() => {
    startTransition(async () => {
      try {
        if (articleLogged) {
          toast.loading('Ładowanie...', { id: 'loading' })
          const inBox = await countInBox(pathWorkplace, articleLogged)
          dispatch(updateInBox(inBox))
          const boxSize = await getBoxSize(pathWorkplace, articleLogged)
          dispatch(updateBoxSize(boxSize))
          const onPallet = await countOnPallet(pathWorkplace, articleLogged)
          dispatch(updateOnPallet(onPallet))
          const palletSize = await getPalletSize(pathWorkplace, articleLogged)
          dispatch(updatePalletSize(palletSize))
          if (inBox >= boxSize) {
            dispatch(toggleIsFullBox())
          }
          if (onPallet >= palletSize) {
            dispatch(toggleIsFullPallet())
          }
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
            {isFullPallet ? (
              <>
                <ScanPalletQr workplace={pathWorkplace} />
                <PrintPalletLabel />
              </>
            ) : isFullBox ? (
              <ScanHydraQr workplace={pathWorkplace} />
            ) : (
              <ScanDmc workplace={pathWorkplace} />
            )}
          </>
        )
      )}
    </div>
  )
}
