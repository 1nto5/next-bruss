'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GetArticlesOptions } from '../actions'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Select from 'react-select'
import { SavePosition } from '../actions'
import Loader from './Loader'

type ArticleOption = {
  value: number
  label: string
}

const selectDarkTheme = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#2D3748' : '#1A202C',
    color: '#F7FAFC', // slate-100 z Tailwind
    '&:hover': {
      backgroundColor: '#4A5568',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#1A202C',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: '#1A202C',
    borderColor: '#4A5568',
    color: '#F7FAFC',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#F7FAFC',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#F7FAFC',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#A0AEC0', // slate-500 w ciemnym trybie powinien być dobrze widoczny
  }),
}

const selectLightTheme = {
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#EDF2F7' : 'white',
    color: '#2D3748',
    '&:hover': {
      backgroundColor: '#E2E8F0', // slate-200 z Tailwind
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: '#CBD5E0',
    color: '#2D3748',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#2D3748',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#2D3748',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#A0AEC0',
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
  if (!/\/card-\d+$/.test(pathname) && !/\/position-\d+$/.test(pathname)) {
    router.push('/inventory')
  }
  const matchesPosition = pathname.match(/position-(\d+)/)
  const matchesCard = pathname.match(/card-(\d+)/)
  const position = matchesPosition ? Number(matchesPosition[1]) : null
  const card = matchesCard ? Number(matchesCard[1]) : null

  const { data: articles, error } = useSWR<ArticleOption[]>(
    'articleOptionKey',
    GetArticlesOptions
  )

  const [wip, setWip] = useState<boolean>(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleOption | null>(
    null
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startSaveTransition(async () => {
      if (card && position) {
        await SavePosition(card, position, {
          article: selectedArticle?.value,
          quantity: 54,
          unit: 'szt',
          WIP: wip,
        })
        router.replace(`position-${position + 1}`)
      }
    })
  }

  if (error) {
    return <div>Wystąpił błąd podczas ładowania.</div>
  }
  if (!articles) {
    return <Loader />
  }
  // return isPendingArticles ? (
  //   <Loader />
  // ) : (
  return (
    <div className="mb-4 mt-4 flex flex-col items-center justify-center">
      <span className="text-xl font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        edit position
      </span>
      <div className="rounded bg-slate-100 p-8 shadow-md dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-center">
            <Select
              options={articles}
              value={selectedArticle}
              onChange={(option) => setSelectedArticle(option as ArticleOption)}
              placeholder="select article"
              className="w-80 text-center"
              menuPlacement="auto"
              styles={isDarkMode ? selectDarkTheme : selectLightTheme}
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
              type="submit"
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            >
              {true ? (
                <svg
                  className="mx-auto h-5 w-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                'confirm'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
