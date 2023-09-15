'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useTransition } from 'react'
import { Register } from '../actions'

type RegisterFormState = {
  fName: string
  lName: string
  password: string
  confirmPassword: string
}

export default function RegisterForm() {
  // Initialize state for the form fields
  const [formState, setFormState] = useState<RegisterFormState>({
    fName: '',
    lName: '',
    password: '',
    confirmPassword: '',
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  // Function to handle changes in input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Update state with the new field values
    setFormState({
      ...formState,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      !formState.fName ||
      !formState.lName ||
      !formState.password ||
      !formState.confirmPassword
    ) {
      setErrorMessage('All fields are necessary!')
      return
    }

    if (formState.fName.length < 3 || formState.lName.length < 3) {
      setErrorMessage('Please enter a valid first and last name.')
      return
    }

    startTransition(async () => {
      try {
        const result = await Register(
          formState.fName,
          formState.lName,
          formState.password
        )
        const status = result?.status
        if (status === 'registered') {
          setFormState({
            fName: '',
            lName: '',
            password: '',
            confirmPassword: '',
          })
          setErrorMessage(null)
          router.push('/auth/login')
        }
        if (status === 'wrong password') {
          setErrorMessage(
            'The password must contain 6 characters, a special character, a number, and an uppercase letter!'
          )
          return
        }

        if (status === 'exists') {
          setErrorMessage('User exists!')
          return
        }
        if (status === 'error') {
          setErrorMessage('Please contact IT!')
          return
        }
      } catch (error) {
        console.error('User registration was unsuccessful.:', error)
        setErrorMessage('Please contact IT!')
        return
      }
    })
  }

  return (
    <div className="grid h-screen place-items-center">
      <div className="rounded-lg border-green-400 p-5 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="w-[400px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
            type="text"
            placeholder="First name"
            name="fName"
            value={formState.fName}
            onChange={handleInputChange}
          />
          <input
            className="w-[400px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
            type="text"
            placeholder="Last name"
            name="lName"
            value={formState.lName}
            onChange={handleInputChange}
          />
          <input
            className="w-[400px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
            type="password"
            placeholder="Password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
          />
          <input
            className="w-[400px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="relative mt-3 flex h-10 items-center justify-center rounded bg-bruss px-4 py-2 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <svg
                className="mx-auto h-5 w-5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Register'
            )}
          </button>

          {errorMessage && (
            <div className="mt-2 w-fit max-w-[400px] break-words rounded-md bg-red-500 px-3 text-lg text-white">
              {errorMessage}
            </div>
          )}
          <Link className="mt-3 text-right text-sm" href={'/auth/login'}>
            Already have an account? <span className="underline">Login</span>
          </Link>
        </form>
      </div>
    </div>
  )
}
