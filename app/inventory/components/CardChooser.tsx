'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { FindLowestFreeCardNumber, GetExistingCardNumbers } from '../actions'
import { useSession } from 'next-auth/react'
import Select from './Select'

type Option = {
  value: number
  label: string
}

//TODO: random card approver

export default function CardChooser() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [cardNumber, setCardNumber] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lowestAvailableNumber, setLowestAvailableNumber] = useState<string>('')
  const [existingCardNumbers, setExistingCardNumbers] = useState<number[]>([])

  useEffect(() => {
    if (errorMessage) {
      setMessage(null)
    }
  }, [errorMessage])

  useEffect(() => {
    if (message) {
      setErrorMessage(null)
    }
  }, [message])

  useEffect(() => {
    startTransition(() => {
      async function fetchLowestNumber() {
        const number = await FindLowestFreeCardNumber()
        setLowestAvailableNumber(number)
      }

      // TODO: jeśli confirmer, wszystkie pozycje
      async function fetchExistingNumbers() {
        if (session?.user?.email) {
          const numbers = await GetExistingCardNumbers(session.user.email)
          setExistingCardNumbers(numbers)
        }
      }
      fetchLowestNumber()
      fetchExistingNumbers()
    })
  }, [session?.user.email])

  const prepareOptions = (numbers: number[]) => {
    return numbers.map((number) => ({
      value: number,
      label: number.toString(),
    }))
  }

  const preparedOptions = prepareOptions(existingCardNumbers)

  const selectedOption = preparedOptions.find(
    (option) => option.value.toString() === cardNumber
  )

  const handleSelectChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setCardNumber(selectedOption.value.toString())
    }
  }

  const handleConfirm = (e: React.FormEvent) => {
    if (cardNumber) {
      router.push(`${pathname}/card-${cardNumber}`)
      return
    }
    setErrorMessage('Card not selected!')
  }

  if (isPending) {
    return (
      <div className="mt-24 flex justify-center">
        <div className="h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss"></div>
      </div>
    )
  }

  return (
    <div className="mb-4 mt-4 flex flex-col items-center justify-center">
      <span className="text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        select card
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
          <Select
            options={preparedOptions}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder={'select card'}
          />
          <div className="mt-4 flex w-full justify-center space-x-2">
            <button
              type="button"
              onClick={() =>
                router.push(`${pathname}/card-${String(lowestAvailableNumber)}`)
              }
              className="w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600"
            >
              first available
            </button>
            <button
              onClick={handleConfirm}
              className="w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
