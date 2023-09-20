'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { FindLowestFreeCardNumber, GetExistingCardNumbers } from '../actions'
import { useSession } from 'next-auth/react'

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
    startTransition(() => {
      async function fetchLowestNumber() {
        const number = await FindLowestFreeCardNumber()
        setLowestAvailableNumber(number)
      }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardNumber !== '') {
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
      <span className="text-xl font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        select card
      </span>
      <div className="rounded bg-slate-100 p-10 shadow-md dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-center">
            <select
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="rounded bg-slate-50 p-2 text-center text-lg font-light shadow-md outline-none dark:bg-slate-600"
              disabled={existingCardNumbers.length === 0}
            >
              <option value="" disabled hidden>
                {existingCardNumbers.length === 0 ? 'no cards' : 'select'}
              </option>
              {existingCardNumbers.length > 0 &&
                existingCardNumbers.map((number) => (
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
                router.push(`${pathname}/card-${String(lowestAvailableNumber)}`)
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
          {message && (
            <div className="mt-6 rounded bg-bruss text-center text-slate-100">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded bg-red-500 text-center  text-slate-100 dark:bg-red-700">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
