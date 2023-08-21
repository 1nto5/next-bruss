import { useAppSelector } from '@/lib/redux/pro/dmc-box-pallet/hooks'
import {
  StatusBox,
  StatusBoxBlinking,
  BoxSeparator,
  StatusBoxSkeleton,
} from '@/app/pro/components/StatusElements'

export default function Status() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)

  const operatorName = useAppSelector((state) => state.operator.name)
  const operatorNumber = useAppSelector(
    (state) => state.operator.personalNumber
  )

  const articleNumber = useAppSelector((state) => state.article.articleNumber)
  const articleName = useAppSelector((state) => state.article.articleName)
  const isFull = useAppSelector((state) => state.workplace.isFull)
  const onPallet = useAppSelector((state) => state.workplace.onPallet)
  const palletSize = useAppSelector((state) => state.workplace.palletSize)
  const boxSize = useAppSelector((state) => state.workplace.boxSize)
  const quantityOnPallet = onPallet! * boxSize!
  const isPending = useAppSelector((state) => state.workplace.isPending)

  const formatOperator = (name: string, personalNumber: number) => {
    const parts = name.split(' ')
    if (parts.length === 2) {
      return `${parts[0]} ${parts[1].charAt(0)}. (${personalNumber})`
    }
    return name
  }

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
      {isPending ? (
        <StatusBoxSkeleton boxName="na palecie:" value="x/y" />
      ) : isFull ? (
        <StatusBoxBlinking
          boxName="na palecie:"
          value={`${onPallet} / ${palletSize} (${quantityOnPallet} szt.)`}
        />
      ) : (
        <StatusBox
          boxName="na palecie:"
          value={
            onPallet === null || palletSize === null
              ? 'brak'
              : `${onPallet} / ${palletSize} (${quantityOnPallet} szt.)`
          }
        />
      )}
      <BoxSeparator />
      {isPending ? (
        <StatusBoxSkeleton boxName="w boxie:" value="x/y" />
      ) : isFull ? (
        <StatusBoxBlinking
          boxName="w boxie:"
          value={`${onPallet} / ${palletSize} (${quantityOnPallet} szt.)`}
        />
      ) : (
        <StatusBox
          boxName="w boxie:"
          value={
            onPallet === null || palletSize === null
              ? 'brak'
              : `${onPallet} / ${palletSize} (${quantityOnPallet} szt.)`
          }
        />
      )}
    </div>
  )
}
