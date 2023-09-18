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
    router.push(`${pathname}/${cardNumber}`)
  }

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg border-green-400 p-5 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-center">
            <select
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-[150px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
              disabled={existingCardNumbers.length === 0}
            >
              <option value="" disabled hidden>
                select card number
              </option>
              {existingCardNumbers.length > 0 ? (
                existingCardNumbers.map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))
              ) : (
                <option>No cards</option>
              )}
            </select>
          </div>
          <div className="mt-3 flex justify-center space-x-3">
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded bg-bruss px-4 py-2 text-white"
              onClick={() => router.push(`${pathname}/${cardNumber}`)}
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(`${pathname}/${String(lowestAvailableNumber)}`)
              }
              className="flex h-10 items-center justify-center rounded bg-blue-500 px-4 py-2 text-white"
            >
              Lowest Available
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
