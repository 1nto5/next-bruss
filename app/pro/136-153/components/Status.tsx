import { useAppSelector } from '@/lib/redux/pro/136-153/hooks'
import {
  StatusBox,
  StatusBoxBlinking,
  BoxSeparator,
  StatusBoxSkeleton,
} from '@/app/components/StatusElements'

export default function Status() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)

  const operatorName = useAppSelector((state) => state.operator.name)
  const operatorNumber = useAppSelector(
    (state) => state.operator.personalNumber
  )

  const isFull136 = useAppSelector((state) => state.workplace.isFull136)
  const isFull153 = useAppSelector((state) => state.workplace.isFull153)
  const onPallet136 = useAppSelector((state) => state.workplace.onPallet136)
  const onPallet153 = useAppSelector((state) => state.workplace.onPallet153)
  const palletSize136 = useAppSelector((state) => state.workplace.palletSize136)
  const palletSize153 = useAppSelector((state) => state.workplace.palletSize153)
  const boxSize136 = useAppSelector((state) => state.workplace.boxSize136)
  const boxSize153 = useAppSelector((state) => state.workplace.boxSize153)
  const quantityOnPallet136 = onPallet136! * boxSize136!
  const quantityOnPallet153 = onPallet153! * boxSize153!
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
      {isPending ? (
        <StatusBoxSkeleton boxName="M153 (28042):" value="x/y" />
      ) : isFull153 ? (
        <StatusBoxBlinking
          boxName="M153 (28042):"
          value={`${onPallet153} / ${palletSize153} (${quantityOnPallet153} szt.)`}
        />
      ) : (
        <StatusBox
          boxName="M153 (28042):"
          value={
            onPallet153 === null || palletSize153 === null
              ? 'brak'
              : `${onPallet153} / ${palletSize153} (${quantityOnPallet153} szt.)`
          }
        />
      )}
      <BoxSeparator />
      {isPending ? (
        <StatusBoxSkeleton boxName="M136 (28067):" value="x/y" />
      ) : isFull136 ? (
        <StatusBoxBlinking
          boxName="M136 (28067):"
          value={`${onPallet136} / ${palletSize136} (${quantityOnPallet136} szt.)`}
        />
      ) : (
        <StatusBox
          boxName="M136 (28067):"
          value={
            onPallet136 === null || palletSize136 === null
              ? 'brak'
              : `${onPallet136} / ${palletSize136} (${quantityOnPallet136} szt.)`
          }
        />
      )}
    </div>
  )
}
