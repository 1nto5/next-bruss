'use client'

import { useAppSelector } from '@/lib/redux/pro/136-153/hooks'
import { useDispatch } from 'react-redux'
import { useEffect, useTransition } from 'react'
import {
  togglePending,
  toggleIsFull136,
  toggleIsFull153,
  updateOnPallet136,
  updateOnPallet153,
  updatePalletSize136,
  updatePalletSize153,
  updateBoxSize136,
  updateBoxSize153,
} from '@/lib/redux/pro/136-153/workplaceSlice'
import Status from './components/Status'
import NumLogIn from '../components/NumLogIn'
import ScanHydraQr from './components/ScanHydraQr'
import ScanPalletQr from './components/ScanPalletQr'
import PrintPalletLabel from './components/PrintPalletLabel'

import {
  countOnPallet136,
  countOnPallet153,
  getPalletSize136,
  getPalletSize153,
  getBoxSize136,
  getBoxSize153,
} from './actions'

import toast from 'react-hot-toast'

export default function OnlyPalletLabel() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const lastScan = useAppSelector((state) => state.workplace.lastScan)

  const dispatch = useDispatch()

  const isFull136 = useAppSelector((state) => state.workplace.isFull136)
  const isFull153 = useAppSelector((state) => state.workplace.isFull153)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    dispatch(togglePending(isPending))
  }, [dispatch, isPending])

  useEffect(() => {
    startTransition(async () => {
      try {
        toast.loading('Ładowanie...', { id: 'loading' })
        const onPallet136 = await countOnPallet136()
        dispatch(updateOnPallet136(onPallet136))
        const onPallet153 = await countOnPallet153()
        dispatch(updateOnPallet153(onPallet153))
        const palletSize136 = await getPalletSize136()
        dispatch(updatePalletSize136(palletSize136))
        const palletSize153 = await getPalletSize153()
        dispatch(updatePalletSize153(palletSize153))
        if (onPallet136 >= palletSize136) {
          dispatch(toggleIsFull136())
        }
        if (onPallet153 >= palletSize153) {
          dispatch(toggleIsFull153())
        }
        const boxSize136 = await getBoxSize136()
        dispatch(updateBoxSize136(boxSize136))
        const boxSize153 = await getBoxSize153()
        dispatch(updateBoxSize153(boxSize153))
        toast.dismiss('loading')
      } catch (error) {
        console.error(
          'Failed to fetch quantity on a pallet, pallet size or box size:',
          error
        )
      }
    })
  }, [dispatch, lastScan])

  return (
    <div>
      {operatorLogged && <Status />}
      {!operatorLogged && <NumLogIn />}
      {isPending ? (
        <div></div>
      ) : (
        operatorLogged && (
          <>
            {isFull136 && (
              <>
                <ScanPalletQr article="28067" />
                <PrintPalletLabel
                  articleNumber={28067}
                  articleName="M-136-K-1-A"
                />
              </>
            )}
            {isFull153 && (
              <>
                <ScanPalletQr article="28042" />
                <PrintPalletLabel
                  articleNumber={28042}
                  articleName="M-153-K-C"
                />
              </>
            )}
            {!isFull136 && !isFull153 && <ScanHydraQr />}
          </>
        )
      )}
    </div>
  )
}
