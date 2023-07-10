'use client'

import { useDispatch } from 'react-redux'
import { logOut } from '../redux/operatorSlice'
import { clearArticle } from '../redux/articleSlice'
import { useAppSelector } from '../redux/hooks'
import Button from './Button'

import toast from 'react-hot-toast'

type HeaderProps = {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const dispatch = useDispatch()

  const operatorLogged = useAppSelector((state) => state.operator.loggedIn)
  const articleLogged = useAppSelector((state) => state.article.artNum)

  const handleLogoutOperator = () => {
    if (window.confirm('Operator zostanie wylogowany! Kontynuować?')) {
      dispatch(logOut()) // Logout operator
      toast.error('Wylogowano!')
    }
  }

  const handleLogoutArticle = () => {
    if (window.confirm('Artykuł zostanie wylogowany! Kontynuować?')) {
      dispatch(clearArticle()) // Clear article
      toast.error('Wylogowano artykuł!')
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 p-4 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <h1 className="text-lg font-thin text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <div className="flex space-x-6">
        {operatorLogged && (
          <Button text="wyloguj operatora" onClick={handleLogoutOperator} />
        )}
        {articleLogged && operatorLogged && (
          <Button text="zmień artykuł" onClick={handleLogoutArticle} />
        )}
      </div>
    </div>
  )
}

export default Header
