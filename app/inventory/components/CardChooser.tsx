'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  FindLowestFreeCardNumber,
  GetExistingCardNumbers,
  ReserveCard,
} from '../actions'
import { useSession } from 'next-auth/react'
import Select from './Select'
import Loader from './Loader'

type Option = {
  value: number
  label: string
}

//TODO: random card approver
// TODO: warunkwe pokazywanie przycisków

export default function CardChooser() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [cardNumber, setCardNumber] = useState<number | null>(null)
  const [warehouse, setWarehouse] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [existingCardNumbers, setExistingCardNumbers] = useState<number[]>([])

  const errorSetter = (message: string) => {
    setErrorMessage(message)
    setMessage(null)
  }

  const messageSetter = (message: string) => {
    setMessage(message)
    setErrorMessage(null)
  }

  useEffect(() => {
    startTransition(() => {
      // TODO: jeśli confirmer, wszystkie pozycje
      async function fetchExistingNumbers() {
        if (session?.user?.email) {
          const numbers = await GetExistingCardNumbers(session.user.email)
          setExistingCardNumbers(numbers)
        }
      }
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
    (option) => option.value === cardNumber
  )

  const handleCardSelectChange = (selectedCardOption: Option | null) => {
    if (selectedCardOption) {
      setCardNumber(selectedCardOption.value)
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

  const selectedWarehauseOption = warehouseSelectOptions.find(
    (option) => option.value.toString() === warehouse
  )

  const handleWarehouseSelectChange = (
    selectedWarehauseOption: Option | null
  ) => {
    if (selectedWarehauseOption) {
      setWarehouse(selectedWarehauseOption.value.toString())
    }
  }

  const reserveCard = () => {
    startTransition(async () => {
      if (session?.user?.email) {
        const number = await FindLowestFreeCardNumber()
        const res = await ReserveCard(number, session?.user.email)
        if (res == 'reserved') {
          router.push(`${pathname}/card=${String(number)}`)
          return
        }
        errorSetter(`Please contact IT!`)
        return
      }
    })
  }

  const handleConfirm = (e: React.FormEvent) => {
    if (cardNumber) {
      router.push(`${pathname}/card=${cardNumber}`)
      return
    }
    setErrorMessage('Card not selected!')
  }

  if (isPending) {
    return <Loader />
  }

  return (
    <div className="justify-cente mb-4 mt-4 flex flex-col items-center">
      <span className="text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        edit position
      </span>
      <div className="flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800">
        <div className="flex w-11/12 flex-col gap-3">
          {errorMessage && (
            <div className="mt-4 flex flex-col items-center justify-center space-y-4">
              {errorMessage && (
                <div className="rounded bg-red-500 p-2 text-center  text-slate-100 dark:bg-red-700">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
          {!warehouse && (
            <Select
              options={preparedCardOptions}
              value={selectedCardOption}
              onChange={handleCardSelectChange}
              placeholder={'select existing card'}
            />
          )}
          {!cardNumber && (
            <Select
              options={warehouseSelectOptions}
              value={selectedWarehauseOption}
              onChange={handleWarehouseSelectChange}
              placeholder={'select warehouse'}
            />
          )}
          <div className="mt-4 flex w-full justify-center space-x-2">
            <button
              type="button"
              onClick={() => reserveCard()}
              className="w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600"
            >
              new card
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
