'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

type LoginFormState = {
  username: string
  password: string
}

export default function LoginForm() {
  // Initialize state for the form fields
  const [formState, setFormState] = useState<LoginFormState>({
    username: '',
    password: '',
  })

  // State to handle error messages
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
    if (!formState.username || !formState.password) {
      setErrorMessage('All fields are necessary!')
      return
    }

    startTransition(async () => {
      try {
        const res = await signIn('credentials', {
          username: formState.username,
          password: formState.password,
          redirect: false,
        })

        if (res && res.error) {
          setErrorMessage('Invlid Credentials!')
          return
        }
        router.replace('/')
      } catch (error) {
        console.error('User login was unsuccessful.:', error)
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
            placeholder="Login (firstname.lastname)"
            name="username"
            value={formState.username}
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
              'Login'
            )}
          </button>
          {errorMessage && (
            <div className="mt-2 w-fit max-w-[400px] break-words rounded-md bg-red-500 px-3 text-lg text-white">
              {errorMessage}
            </div>
          )}
          <Link className="mt-3 text-right text-sm" href={'/auth/register'}>
            Don&apos;t have an account?{' '}
            <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </div>
  )
}
