import { useDispatch } from 'react-redux'
import { setArticle } from '@/lib/redux/pro/articleSlice'
// import config from '@/configs/only-pallet-label.json'
import toast from 'react-hot-toast'

type StatusProps = {
  workplace: string
}

export default function ArticleSelector({ workplace }: StatusProps) {
  const dispatch = useDispatch()

  const articles = config.find((data) => data.workplace === workplace)?.articles

  const handleClick = (article: { number: number; name: string }) => {
    dispatch(
      setArticle({
        articleNumber: article.number,
        articleName: article.name,
      })
    )
    toast.success('Artykuł zalogowany!', { id: 'success' })
  }

  return (
    <div className="mb-4 mt-4 flex flex-wrap items-center justify-center">
      {articles?.map((article) => (
        <button
          key={article.number}
          onClick={() => handleClick(article)}
          className="m-8 rounded bg-slate-200 p-6 text-center text-3xl text-slate-900 shadow-sm hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          <div className="flex flex-col items-center">
            <span className="font-4xl">{article.number}</span>
            <span className="text-lg font-thin">{article.name}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
