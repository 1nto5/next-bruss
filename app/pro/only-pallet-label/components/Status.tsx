import { useSelector } from 'react-redux'
import { useAppSelector } from '@/lib/redux/pro/hooks'
import {
  StatusBox,
  StatusBoxBlinking,
  BoxSeparator,
} from '@/app/pro/components/StatusElements'
import { getQuantityOnPallet } from '../actions'

export default function Status() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.articleNumber)

  const operatorName = useSelector(
    (state: { operator: { name: string; personalNumber: number } }) =>
      state.operator.name
  )
  const operatorNumber = useSelector(
    (state: { operator: { name: string; personalNumber: number } }) =>
      state.operator.personalNumber
  )

  const formatOperator = (name: string, personalNumber: number) => {
    const parts = name.split(' ')
    if (parts.length === 2) {
      return `${parts[0]} ${parts[1].charAt(0)}. (${personalNumber})`
    }
    return name
  }

  const articleNumber = useSelector(
    (state: { article: { articleNumber: number; articleName: string } }) =>
      state.article.articleNumber
  )
  const articleName = useSelector(
    (state: { article: { articleNumber: number; articleName: string } }) =>
      state.article.articleName
  )

  return (
    <div className="flex flex-row items-center justify-between bg-slate-100 pb-4 pt-4 shadow-md dark:bg-slate-800">
      <StatusBox
        boxName="operator:"
        value={
          operatorLogged
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
      <StatusBox boxName="na palecie:" value={'test'} />
    </div>
  )
}
