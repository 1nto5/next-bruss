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
  const [cardNumber, setCardNumber] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lowestAvailableNumber, setLowestAvailableNumber] = useState<string>('')
  const [existingCardNumbers, setExistingCardNumbers] = useState<number[]>([])

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

  const prepareCardOptions = (numbers: number[]) => {
    return numbers.map((number) => ({
      value: number,
      label: number.toString(),
    }))
  }

  const preparedCardOptions = prepareCardOptions(existingCardNumbers)

  const selectedCardOption = preparedCardOptions.find(
    (option) => option.value.toString() === cardNumber
  )

  const handleCardSelectChange = (selectedCardOption: Option | null) => {
    if (selectedCardOption) {
      setCardNumber(selectedCardOption.value.toString())
    }
  }

  const warehouseSelectOptions = [
    { value: 0, label: '000 - Rohstolfe und Fertigteile' },
    { value: 35, label: '035 - Metalteile Taicang' },
    { value: 54, label: '054 - Magazyn wstrzymangch' },
    { value: 55, label: '055 - Cz.zablokowane GTM' },
    { value: 111, label: '111 - Magazyn Launch' },
    { value: 222, label: '222 - Magazyn zablokowany produkcja' },
    // { value: 999, label: '999 - WIP' },
  ]

  const handleWarehouseSelectChange = (selectedCardOption: Option | null) => {
    if (selectedCardOption) {
      setWarehouse(selectedCardOption.value.toString())
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
          {errorMessage && (
            <div className="rounded bg-red-500 p-2 text-center  text-slate-100 dark:bg-red-700">
              {errorMessage}
            </div>
          )}
          <Select
            options={preparedCardOptions}
            value={selectedCardOption}
            onChange={handleCardSelectChange}
            placeholder={'select card'}
          />
          <Select
            options={warehouseSelectOptions}
            value={warehouse}
            onChange={handleWarehouseSelectChange}
            placeholder={'select warehouse'}
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
