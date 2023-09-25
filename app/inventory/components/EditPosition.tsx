'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GetArticlesOptions } from '../actions'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import Select from 'react-select'
import { SavePosition, GetArticleConfig } from '../actions'
import Loader from './Loader'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

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

type ArticleOption = {
  value: number
  label: string
}

type ArticleConfig = {
  number: number
  name: string
  unit: string
  converter?: number
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
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isPendingSaving, startSaveTransition] = useTransition()
  const [isPending, setIsPending] = useState(false)
  const { data: articlesOptions, error: getArticlesOptionsError } = useSWR<
    ArticleOption[]
  >('articlesOptionsKey', GetArticlesOptions)

  const [wip, setWip] = useState<boolean>(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleOption | null>(
    null
  )
  const [selectedArticleConfig, setSelectedArticleConfig] =
    useState<ArticleConfig | null>(null)

  useEffect(() => {
    const getArticleConfig = async (article: number) => {
      setIsPending(true)
      const articleConfig = await GetArticleConfig(article)
      setSelectedArticleConfig(articleConfig as ArticleConfig)
      setIsPending(false)
    }
    if (selectedArticle) {
      getArticleConfig(selectedArticle.value)
    }
    return () => {}
  }, [selectedArticle])

  const [quantity, setQuantity] = useState<number>(0)

  //TODO: nie pozwalaj zapisywać gdy ręcznie nr karty w adresie
  const savePosition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (card && position) {
      try {
        setIsPending(true)
        const res = await SavePosition(card, position, {
          article: selectedArticle?.value,
          quantity: 54,
          unit: 'szt',
          WIP: wip,
        })
        setIsPending(false)
        if (res === 'saved') {
          setMessage(`Position ${position} saved!`)
          return
        }
      } catch (error) {
        setErrorMessage(`Saving position error. Please contact IT!`)
      }
    }
  }

  if (getArticlesOptionsError) {
    setErrorMessage('An error occurred during loading artiles options.')
  }
  if (!articlesOptions) {
    return <Loader />
  }
  if (isPending) {
    return <Loader />
  }
  return (
    <div className="mb-4 mt-4 flex flex-col items-center justify-center">
      <span className="text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        edit position
      </span>
      <div className="flex rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800">
        <div className="flex flex-col gap-3">
          {message && (
            <div className="rounded bg-bruss p-2 text-center text-slate-100">
              {message}
            </div>
          )}
          {errorMessage && (
            <div className="rounded bg-red-500 p-2 text-center  text-slate-100 dark:bg-red-700">
              {errorMessage}
            </div>
          )}
          <div className="flex items-center justify-start">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={wip}
                onChange={(e) => setWip(e.target.checked)}
              />
              <span>WIP</span>
            </label>
          </div>
          <div className="flex items-center justify-center">
            <Select
              options={articlesOptions}
              value={selectedArticle}
              onChange={(option) => setSelectedArticle(option as ArticleOption)}
              placeholder="select article"
              className="w-80 text-center"
              menuPlacement="auto"
              styles={isDarkMode ? selectDarkTheme : selectLightTheme}
            />
          </div>

          {/* QUANTITY */}
          {selectedArticleConfig && (
            <div className="flex items-center justify-center">
              <input
                type="number"
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder={
                  selectedArticleConfig.converter
                    ? 'Enter quantity in kg'
                    : selectedArticleConfig.unit === 'kg'
                    ? 'Enter quantity in kg'
                    : selectedArticleConfig.unit === 'st'
                    ? 'Enter quantity in pieces'
                    : 'Wrong article'
                }
                className="w-50 rounded bg-white p-1 text-center shadow-sm outline-none dark:bg-slate-800"
              />
            </div>
          )}

          {/* CONVERTER */}
          {selectedArticleConfig?.converter && (
            <div className="flex items-center justify-center">
              {Math.floor(quantity * selectedArticleConfig.converter)} st
            </div>
          )}

          <div className="mt-4 flex justify-center space-x-3">
            <button
              onClick={savePosition}
              className=" w-3/4 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
              disabled={isPendingSaving}
            >
              save
            </button>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={(e) => {
                if (position !== null) {
                  if (position !== 1) {
                    router.replace(`position-${position - 1}`)
                  } else {
                    e.preventDefault()
                    setErrorMessage('No 0 position!')
                  }
                }
              }}
              className="rounded bg-slate-200 p-3 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-orange-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-orange-500"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => {
                if (position !== null && position != 25) {
                  router.replace(`position-${position + 1}`)
                }
              }}
              className="rounded bg-slate-200 p-3 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
