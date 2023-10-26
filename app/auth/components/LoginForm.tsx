'use client';

// TODO: match styles

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type LoginFormState = {
  email: string;
  password: string;
};

export default function LoginForm() {
  // Initialize state for the form fields
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });

  // State to handle error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // Function to handle changes in input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Update state with the new field values
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formState.email || !formState.password) {
      setErrorMessage('All fields are necessary!');
      return;
    }

    startTransition(async () => {
      try {
        const res = await signIn('credentials', {
          email: formState.email,
          password: formState.password,
          redirect: false,
        });

        if (res && res.error) {
          setErrorMessage('Invlid Credentials!');
          return;
        }
        router.replace('/');
      } catch (error) {
        console.error('User login was unsuccessful.:', error);
        setErrorMessage('Please contact IT!');
        return;
      }
    });
  };

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        login form
      </span>
      <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
        <div className='flex w-11/12 flex-col items-center justify-center gap-3'>
          {errorMessage ? (
            <div className='flex flex-col items-center justify-center space-y-4'>
              {errorMessage && (
                <div className='rounded bg-red-500 p-2 text-center  text-slate-100 dark:bg-red-700'>
                  {errorMessage}
                </div>
              )}
            </div>
          ) : null}

          <form
            onSubmit={handleLogin}
            className='flex w-11/12 flex-col items-center justify-center gap-3'
          >
            <input
              className=' w-9/12 rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900 dark:outline-slate-600'
              type='email'
              name='email'
              placeholder='email'
              value={formState.email}
              onChange={handleInputChange}
            />
            <input
              className='w-9/12 rounded border-slate-700 bg-white p-1 text-center shadow-sm   dark:bg-slate-900 dark:outline-slate-600'
              type='password'
              name='password'
              placeholder='password'
              value={formState.password}
              onChange={handleInputChange}
            />
            <button
              type='submit'
              className='w-5/12 max-w-lg rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
              disabled={isPending}
            >
              {isPending ? 'logging...' : 'login'}
            </button>
          </form>
          <Link className='mt-3 text-right text-sm' href={'/auth/register'}>
            Don&apos;t have an account?{' '}
            <span className='underline'>Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
