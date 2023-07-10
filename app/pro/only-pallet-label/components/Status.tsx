import { useSelector } from 'react-redux'
import { useAppSelector } from '../../redux/hooks'
import {
  StatusBox,
  StatusBoxBlinking,
  BoxSeparator,
} from '@/app/pro/components/StatusElements'

const Status: React.FC = () => {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.artNum)

  const operatorName = useSelector(
    (state: { operator: { name: string; persNum: number } }) =>
      state.operator.name
  )
  const operatorNum = useSelector(
    (state: { operator: { name: string; persNum: number } }) =>
      state.operator.persNum
  )

  const formatOperator = (name: string, persNum: number) => {
    const parts = name.split(' ')
    if (parts.length === 2) {
      return `${parts[0]} ${parts[1].charAt(0)}. (${persNum})`
    }
    return name
  }

  const artNum = useSelector(
    (state: { article: { artNum: number; artName: string } }) =>
      state.article.artNum
  )
  const artName = useSelector(
    (state: { article: { artNum: number; artName: string } }) =>
      state.article.artName
  )

  return (
    <div className="flex flex-row items-center justify-between bg-slate-100 pb-4 pt-4 shadow-md dark:bg-slate-800">
      <StatusBox
        boxName="operator:"
        value={
          operatorLogged
            ? formatOperator(operatorName, operatorNum)
            : 'nie zalogowany'
        }
      />
      <BoxSeparator />
      <StatusBox
        boxName="artykuł:"
        value={articleLogged ? `${artName} (${artNum})` : 'nie wybrany'}
      />
      <BoxSeparator />
      <StatusBox boxName="na palecie:" value={'x/y'} />
    </div>
  )
}

export default Status
