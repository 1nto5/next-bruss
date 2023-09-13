'use client'

import Link from 'next/link'
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

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

    startTransition(async () => {
      try {
        const result = await Register(
          formState.fName,
          formState.lName,
          formState.password
        )
        const status = result?.status
        if (status === 'registered') {
          setSuccessMessage('Registration successful!')
          setFormState({
            fName: '',
            lName: '',
            password: '',
            confirmPassword: '',
          })
          setErrorMessage(null)
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
            className="mt-3 rounded bg-bruss px-4 py-2 text-white"
          >
            Register
          </button>
          {errorMessage && (
            <div className="mt-2 w-fit rounded-md bg-red-500 px-3 text-lg text-white">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-2 w-fit rounded-md bg-yellow-500 px-3 text-lg text-white">
              {successMessage}
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
