'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GetArticlesOptions } from '../actions'
import { useSession } from 'next-auth/react'
import Select from 'react-select'
import { SavePosition } from '../actions'

type ArticleOption = {
  value: number
  label: string
}

const selectDarkTheme = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'slategray' : 'black',
    color: 'white',
    '&:hover': {
      backgroundColor: 'darkgray',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'black',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'black',
    borderColor: 'darkgray',
    color: 'white',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
}

export default function CardPositionForm() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode()
        }
      })
    })

    // Obserwuj zmiany w atrybutach elementu <html>
    observer.observe(document.documentElement, { attributes: true })

    // Sprawdź tryb ciemny przy pierwszym uruchomieniu
    checkDarkMode()

    // Czyść obserwatora podczas demontażu komponentu
    return () => observer.disconnect()
  }, [])

  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const matchesPosition = pathname.match(/position-(\d+)/)
  const matchesCard = pathname.match(/card-(\d+)/)
  const position = matchesPosition ? Number(matchesPosition[1]) : null
  const card = matchesCard ? Number(matchesCard[1]) : null
  const [isPendingArticles, startArticlesTransition] = useTransition()
  const [selectArticleOptions, setSelectArticleOptions] = useState<
    ArticleOption[]
  >([])

  useEffect(() => {
    startArticlesTransition(async () => {
      const fetchedArticles: ArticleOption[] = await GetArticlesOptions()
      setSelectArticleOptions(fetchedArticles)
    })
  }, [])

  const [wip, setWip] = useState<boolean>(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleOption | null>(
    null
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startArticlesTransition(async () => {
      if (card && position) {
        await SavePosition(card, position, {
          article: selectedArticle?.value,
          quantity: 54,
          unit: 'szt',
        })
        router.replace(`position-${position + 1}`)
      }
    })
  }

  if (isPendingArticles) {
    return (
      <div className="mt-24 flex justify-center">
        <div className="h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss"></div>
      </div>
    )
  }

  return (
    <div className="mt-12 flex flex-col items-center justify-center">
      <span className="text-xl font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        edit position
      </span>
      <div className="rounded bg-slate-100 p-8 shadow-md dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-center">
            <Select
              options={selectArticleOptions}
              value={selectedArticle}
              onChange={(option) => setSelectedArticle(option as ArticleOption)}
              placeholder="select article"
              className="w-80 text-center"
              menuPlacement="auto"
              styles={isDarkMode ? selectDarkTheme : {}}
            />
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={wip}
                onChange={(e) => setWip(e.target.checked)}
              />
              <span>WIP</span>
            </label>
          </div>
          <div className="mt-4 flex justify-center space-x-3">
            <button
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
              onClick={() => console.log('print')}
            >
              print label
            </button>
            <button
              type="submit"
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
              onClick={() => console.log('click')}
            >
              confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
