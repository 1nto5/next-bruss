//TODO https://nextjs.org/learn/basics/dynamic-routes/page-path-external-data - generete paths based on config file

'use client'

import { useAppSelector } from '@/lib/redux/pro/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition, useState } from 'react'

import Status from '../components/Status'
import NumLogIn from '../../components/NumLogIn'
import ArticleSelector from '../components/ArticleSelector'
import ScanHydraBatch from '../components/ScanHydraBatch'

import { countOnPallet, getPalletSize } from '../actions'

export default function OnlyPalletLabel() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)
  const pathWorkplace = usePathname().split('/').pop() || ''
  const lastScan = useAppSelector((state) => state.workStage.lastScan)
  const [isFull, setIsFull] = useState(false)
  const [onPallet, setOnPallet] = useState(0)
  const [palletSize, setPalletSize] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      try {
        if (articleLogged) {
          const onPallet = await countOnPallet(pathWorkplace, articleLogged)
          setOnPallet(onPallet)
          const palletSize = await getPalletSize(pathWorkplace, articleLogged)
          setPalletSize(palletSize)
          onPallet >= palletSize && setIsFull(true)
        }
      } catch (error) {
        console.error(
          'Failed to fetch quantity on a pallet and pallet size:',
          error
        )
      }
    })
  }, [articleLogged, lastScan, pathWorkplace])

  return (
    <div>
      {operatorLogged && (
        <Status
          isPending={isPending}
          onPallet={onPallet}
          palletSize={palletSize}
          isFull={isFull}
        />
      )}
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
