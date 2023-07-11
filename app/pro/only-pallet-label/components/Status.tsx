import { useEffect, useTransition, useState } from 'react'
import { useAppSelector } from '@/lib/redux/pro/hooks'
import {
  StatusBox,
  StatusBoxBlinking,
  BoxSeparator,
} from '@/app/pro/components/StatusElements'
import { getOnPalletAndPalletSize } from '../actions'

export default function Status() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)
  const lastScan = useAppSelector((state) => state.workStage.lastScan)
  const operatorName = useAppSelector((state) => state.operator.name)
  const operatorNumber = useAppSelector(
    (state) => state.operator.personalNumber
  )

  const articleNumber = useAppSelector((state) => state.article.articleNumber)
  const articleName = useAppSelector((state) => state.article.articleName)

  const formatOperator = (name: string, personalNumber: number) => {
    const parts = name.split(' ')
    if (parts.length === 2) {
      return `${parts[0]} ${parts[1].charAt(0)}. (${personalNumber})`
    }
    return name
  }

  // State for the quantity on a pallet
  const [palletStatus, setPalletStatus] = useState<{
    onPallet: number
    palletSize: number
  } | null>(null)

  // Use transition to display a loading state while fetching the quantity on a pallet
  const [isPending, startTransition] = useTransition()

  // Effect to fetch the quantity on a pallet whenever lastScan changes
  useEffect(() => {
    startTransition(async () => {
      try {
        if (articleNumber && articleNumber !== 0) {
          const pallet = await getOnPalletAndPalletSize(articleNumber)
          setPalletStatus(pallet)
        } else {
          setPalletStatus(null)
        }
      } catch (error) {
        console.error('Failed to fetch quantity on a pallet:', error)
      }
    })
  }, [articleNumber, lastScan])

  return (
    <div className="flex flex-row items-center justify-between bg-slate-100 pb-4 pt-4 shadow-md dark:bg-slate-800">
      <StatusBox
        boxName="operator:"
        value={
          operatorLogged && operatorName && operatorNumber
            ? formatOperator(operatorName, operatorNumber)
            : 'nie zalogowany'
        }
      />
      <BoxSeparator />
      <StatusBox
        boxName="artykuł:"
        value={
          articleLogged ? `${articleName} (${articleNumber})` : 'nie wybrany'
        }
      />
      <BoxSeparator />
      {palletStatus && palletStatus.onPallet === palletStatus.palletSize ? (
        <StatusBoxBlinking
          boxName="na palecie:"
          value={`${palletStatus.onPallet} / ${palletStatus.palletSize}`}
        />
      ) : (
        <StatusBox
          boxName="na palecie:"
          value={
            isPending
              ? 'Loading...'
              : palletStatus
              ? `${palletStatus.onPallet} / ${palletStatus.palletSize}`
              : 'Brak danych'
          }
        />
      )}
    </div>
  )
}
