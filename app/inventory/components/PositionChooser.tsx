'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  ReserveCard,
  GetExistingPositions,
  FindLowestFreePosition,
} from '../actions'
import { useSession } from 'next-auth/react'
import Loader from './Loader'

export default function PositionChooser() {
  const router = useRouter()
  const pathname = usePathname()
  if (!/\/card-\d+$/.test(pathname)) {
    router.push('/inventory')
  }
  const matches = pathname.match(/card-(\d+)/)
  const cardNumber = matches ? Number(matches[1]) : null
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [lowestAvailableNumber, setLowestAvailableNumber] = useState<number>()
  const [existingPositionNumbers, setExistingPositionNumbers] = useState<
    number[]
  >([])
  const [positionNumber, setPositionNumber] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    startTransition(async () => {
      if (session?.user?.email && cardNumber) {
        const res = await ReserveCard(cardNumber, session?.user.email)
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
    })
  }, [cardNumber, router, session?.user.email])

  useEffect(() => {
    startTransition(async () => {
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

      fetchExistingPositions()
      fetchLowestFreePosition()
    })
  }, [cardNumber, session?.user.email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (positionNumber !== '') {
      router.push(`${pathname}/position-${positionNumber}`)
      return
    }
    setErrorMessage('Position not selected!')
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
          <div className="flex items-center justify-center">
            <select
              value={positionNumber}
              onChange={(e) => setPositionNumber(e.target.value)}
              className="rounded bg-slate-50 p-2 text-center text-lg font-light shadow-md outline-none dark:bg-slate-600"
              disabled={existingPositionNumbers.length === 0}
            >
              <option value="" disabled hidden>
                {existingPositionNumbers.length === 0 ? 'empty card' : 'select'}
              </option>
              {existingPositionNumbers.length > 0 &&
                existingPositionNumbers.map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
            </select>
          </div>
          <div className="mt-6 flex justify-center space-x-12">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `${pathname}/position-${String(lowestAvailableNumber)}`
                )
              }
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600"
            >
              first available
            </button>
            <button
              type="submit"
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
