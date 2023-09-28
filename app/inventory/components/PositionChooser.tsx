'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  ReserveCard,
  GetExistingPositions,
  FindLowestFreePosition,
} from '../actions'
import { useSession } from 'next-auth/react'
import Loader from './Loader'
import Select from './Select'

type Option = {
  value: number
  label: string
}

export default function PositionChooser() {
  const router = useRouter()
  const pathname = usePathname()
  if (!/\/card-\d+$/.test(pathname)) {
    router.push('/inventory')
  }
  const matches = pathname.match(/card-(\d+)/)
  const cardNumber = matches ? Number(matches[1]) : null
  const { data: session } = useSession()
  const [isPending, setIsPending] = useState(true)
  const [lowestAvailableNumber, setLowestAvailableNumber] = useState<number>()
  const [existingPositionNumbers, setExistingPositionNumbers] = useState<
    number[]
  >([])
  const [positionNumber, setPositionNumber] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fullCard, setFullCard] = useState(false)

  useEffect(() => {
    async function reserveCard() {
      if (session?.user?.email && cardNumber) {
        setIsPending(true)
        const res = await ReserveCard(cardNumber, session?.user.email)
        setIsPending(false)
        if (res == 'reserved') {
          setMessage(`Card number: ${cardNumber} reserved!`)
          return
        }
        if (res == 'exists') {
          setMessage(`Card number: ${cardNumber} selected!`)
          return
        }
        if (res == 'no access') {
          router.push('/inventory')
          return
        }
        setErrorMessage(`Please contact IT!`)
        return
      }
    }

    async function fetchExistingPositions() {
      if (session?.user?.email && cardNumber) {
        const res = await GetExistingPositions(cardNumber)
        if (res) {
          setExistingPositionNumbers(res)
          return
        }
        setErrorMessage('Please contact IT!')
        return
      }
    }
    async function fetchLowestFreePosition() {
      if (session?.user?.email && cardNumber) {
        const res = await FindLowestFreePosition(cardNumber)
        if (res === 'full') {
          setErrorMessage('Card is full!')
          setFullCard(true)
          return
        }
        if (res) {
          setLowestAvailableNumber(res)
          return
        }
        setErrorMessage('Please contact IT!')
        return
      }
    }
    setIsPending(true)
    reserveCard()
    fetchExistingPositions()
    fetchLowestFreePosition()
    setIsPending(false)
  }, [cardNumber, router, session?.user.email])

  const prepareOptions = (numbers: number[]) => {
    return numbers.map((number) => ({
      value: number,
      label: number.toString(),
    }))
  }

  const preparedOptions = prepareOptions(existingPositionNumbers)

  const selectedOption = preparedOptions.find(
    (option) => option.value.toString() === positionNumber
  )

  const handleConfirm = (e: React.FormEvent) => {
    if (positionNumber) {
      router.push(`${pathname}/position-${positionNumber}`)
      return
    }
    setErrorMessage('Position not selected!')
  }

  const handleSelectChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setPositionNumber(selectedOption.value.toString())
    }
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
          {preparedOptions.length > 0 && (
            <Select
              options={preparedOptions}
              value={selectedOption}
              onChange={handleSelectChange}
              placeholder={'select position'}
            />
          )}

          <div className="mt-4 flex w-full justify-center space-x-2">
            {!fullCard && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `${pathname}/position-${String(lowestAvailableNumber)}`
                  )
                }
                className="w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600"
              >
                {preparedOptions.length > 0 ? 'first free' : 'start card'}
              </button>
            )}
            {preparedOptions.length > 0 && (
              <button
                type="submit"
                onClick={handleConfirm}
                className="w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
              >
                confirm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
