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
    router.push(`${pathname}/card-${cardNumber}`)
  }

  if (isPending) {
    return (
      <div className="mt-24 flex justify-center">
        <div className="h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss"></div>
      </div>
    )
  }

  return (
    <div className="mt-12 flex flex-col items-center justify-center">
      <span className="text-xl font-extralight tracking-widest text-slate-700 dark:text-slate-100">
        select card
      </span>
      <div className="rounded bg-slate-100 p-8 shadow-md dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-center">
            <select
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="rounded bg-slate-50 p-2 text-center text-lg font-light shadow-md outline-none dark:bg-slate-700"
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
          <div className="mt-4 flex justify-center space-x-3">
            <button
              type="button"
              onClick={() =>
                router.push(`${pathname}/card-${String(lowestAvailableNumber)}`)
              }
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
            >
              first available
            </button>
            <button
              type="submit"
              className="rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss"
              onClick={() => router.push(`${pathname}/card?${cardNumber}`)}
            >
              confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
