'use client'

import Link from 'next/link'
import React, { useState } from 'react'

type LoginFormState = {
  email: string
  password: string
}

export default function LoginForm() {
  // Initialize state for the form fields
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  })

  // State to handle error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Function to handle changes in input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Update state with the new field values
    setFormState({
      ...formState,
      [name]: value,
    })
  }

  return (
    <div className="grid h-screen place-items-center">
      <div className="rounded-lg border-green-400 p-5 shadow-lg">
        <form className="flex flex-col gap-3">
          <input
            className="w-[400px] border border-gray-200 bg-zinc-100/40 px-6 py-2"
            type="text"
            placeholder="Email"
            name="email"
            value={formState.email}
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
            className="mt-3 rounded bg-bruss px-4 py-2 text-white"
          >
            Login
          </button>
          {errorMessage && (
            <div className="mt-2 w-fit rounded-md bg-red-500 px-3 text-sm text-white">
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
