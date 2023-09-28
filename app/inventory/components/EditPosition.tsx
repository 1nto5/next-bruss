'use client'

// nie pozwalaj edytować pozycji gdy poprzednie nie zamknięta

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { GetPosition, SavePosition, GetArticles } from '../actions'
import Select from './Select'
import Loader from './Loader'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

type Article = {
  value: string
  label: string
  number: number
  name: string
  unit: string
  converter: number
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
  const [isPending, setIsPending] = useState(false)
  const { data: articles, error: getArticlesError } = useSWR<Article[]>(
    'articlesKey',
    GetArticles
  )
  const [wip, setWip] = useState<boolean>(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [quantity, setQuantity] = useState<number>(0)
  const [identifier, setIdentifier] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      if (card && position) {
        const positionData = await GetPosition(card, position)
        if (positionData) {
          if (positionData.status == 'wrong position') {
            router.push('/inventory')
          }
          positionData.status == 'no card' && setErrorMessage('No card!')
          positionData.status == 'skipped' &&
            setErrorMessage(
              `Return to position number: ${positionData.position}!`
            )
          positionData.status == 'new' &&
            setMessage('Editing a new position...')
        }
        if (positionData.status == 'found') {
          setMessage('The position exists, content retrieved!')
          setIdentifier(positionData.position.identifier)
          setQuantity(positionData.position.quantity)
          if (articles) {
            const foundArticle = articles.find(
              (article) =>
                article.number === positionData.position.articleNumber
            )
            foundArticle && setSelectedArticle(foundArticle)
          }
        }
      }
    }
    setIsPending(true)
    fetchData()
    setIsPending(false)
    return () => {}
  }, [articles, card, position, router])

  //TODO: nie pozwalaj zapisywać gdy ręcznie nr karty w adresie
  const savePosition = async () => {
    if (identifier !== '') {
      if (
        !window.confirm(
          'Are you sure you want to save the position again? This will generate a new identifier and require it to be noted on the inventory item.'
        )
      ) {
        return
      }
    }
    if (!selectedArticle) {
      setErrorMessage('Select an article!')
      return
    }
    if (!quantity || quantity === 0) {
      setErrorMessage('Enter the correct quantity!')
      return
    }
    if (card && position) {
      try {
        const converter = selectedArticle?.converter
        let finalQuantity
        if (converter) {
          finalQuantity = Math.floor(quantity * converter)
        } else {
          finalQuantity = quantity
        }

        if (selectedArticle && session?.user.email) {
          setIsPending(true)
          const res = await SavePosition(
            card,
            position,
            selectedArticle.number,
            selectedArticle.name,
            finalQuantity,
            selectedArticle.unit,
            wip,
            session.user.email
          )

          if (res?.status === 'added') {
            res?.identifier && setIdentifier(res?.identifier)
            setErrorMessage(null)
            setMessage(`Position ${position} added!`)
          } else if (res?.status === 'updated') {
            res?.identifier && setIdentifier(res?.identifier)
            setErrorMessage(null)
            setMessage(`Position ${position} updated!`)
          } else if (
            res?.status === 'not added' ||
            res?.status === 'not updated'
          ) {
            setErrorMessage('Saving position error. Please contact IT!')
          }
        }
      } catch (error) {
        setErrorMessage('Saving position error. Please contact IT!')
      } finally {
        setIsPending(false)
      }
    }
  }

  const selectArticle = (option: Article | null) => {
    setSelectedArticle(option)
  }

  if (getArticlesError) {
    setErrorMessage('An error occurred during loading artiles options.')
  }
  if (!articles) {
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
          {identifier && (
            <div className="rounded bg-black p-2 text-center text-2xl font-semibold text-slate-100">
              {identifier}
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

          <Select
            options={articles}
            value={selectedArticle}
            onChange={selectArticle}
            placeholder={'select article'}
          />

          {/* QUANTITY */}
          {selectedArticle && (
            <div className="flex items-center justify-center">
              <input
                type="number"
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="quantity"
                defaultValue={quantity !== 0 ? quantity : undefined}
                className="w-20 rounded bg-white p-1 text-center shadow-sm outline-none dark:bg-slate-800"
              />{' '}
              {!selectedArticle.converter ? selectedArticle.unit : 'kg'}
            </div>
          )}

          {/* CONVERTER */}
          {selectedArticle?.converter && (
            <div className="flex items-center justify-center">
              = {Math.floor(quantity * selectedArticle.converter)} st
            </div>
          )}

          <div className="mt-4 flex justify-center space-x-3">
            <button
              onClick={savePosition}
              className=" w-3/4 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            >
              save
            </button>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => {
                if (position !== null) {
                  if (position !== 1) {
                    router.replace(`position-${position - 1}`)
                  } else {
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
                } else {
                  setErrorMessage('The card is full!')
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
