'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  ReserveCard,
  GetExistingPositions,
  FindLowestFreePosition,
} from '../actions'
import { useSession } from 'next-auth/react'
import CardChooser from './CardChooser'

export default function PositionChooser() {
  const router = useRouter()
  const pathname = usePathname()
  const cardNumber = Number(pathname.split('/').pop())
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [lowestAvailableNumber, setLowestAvailableNumber] = useState<string>('')
  const [existingCardNumbers, setExistingPositionNumbers] = useState<number[]>(
    []
  )

  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    startTransition(async () => {
      if (session?.user?.email) {
        const result = await ReserveCard(cardNumber, session?.user.email)
        const status = result?.status
        if (status == 'reserved') {
          setMessage(`Card number: ${cardNumber} reserved!`)
        }
        if (status == 'exists') {
          setErrorMessage(`Card number: ${cardNumber} exists!`)
        }
        if (status == 'error') {
          setErrorMessage(`Please contact IT!`)
        }
      }
      async function fetchExistingPositions() {
        if (session?.user?.email) {
          const numbers = await GetExistingPositions(cardNumber)
          setExistingPositionNumbers(numbers)
        }
      }
      async function fetchLowestFreePosition() {
        if (session?.user?.email) {
          const number = await FindLowestFreePosition(cardNumber)
          setLowestAvailableNumber(number)
        }
      }

      fetchExistingPositions()
      fetchLowestFreePosition()
    })
  }, [cardNumber, session?.user.email])

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
              // onChange={(e) => setCardNumber(e.target.value)}
              className="w-[150px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
              disabled={existingCardNumbers.length === 0}
            >
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
