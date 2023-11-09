'use client';

import { useContext, useState, useRef } from 'react';
import { login } from '../actions';
import { PersonsContext } from '../lib/PersonsContext';
import clsx from 'clsx';

type LoginFormState = {
  personalNumber: string;
  password: string;
};

export default function LoginForm() {
  const personsContext = useContext(PersonsContext);

  const [formState, setFormState] = useState<LoginFormState>({
    personalNumber: '',
    password: '',
  });

  const personalNumberInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formState.personalNumber || !formState.password) {
      setErrorMessage('Uzupełnij wszystkie pola!');
      return;
    }

    setIsPending(true);
    try {
      const res = await login(formState.personalNumber, formState.password);
      if (!res) {
        setErrorMessage('Dane niepoprawne!');
        return;
      }
      setFormState({ personalNumber: '', password: '' });

      if (!personsContext?.persons.first) {
        personsContext?.setPersons((prevState) => ({
          ...prevState,
          first: formState.personalNumber,
          nameFirst: res,
        }));
        setMessage('Zalogowano pierwszą osobę!');
        setErrorMessage(null);
        personalNumberInputRef.current &&
          personalNumberInputRef.current.focus();
        return;
      }
      if (personsContext?.persons.first === formState.personalNumber) {
        setErrorMessage('Wpisz nr. personalny drugiej osoby!');
        setMessage(null);
        personalNumberInputRef.current &&
          personalNumberInputRef.current.focus();
        return;
      }
      if (!personsContext?.persons.second) {
        personsContext?.setPersons((prevState) => ({
          ...prevState,
          second: formState.personalNumber,
          nameSecond: res,
        }));
        setMessage(null);
        setErrorMessage(null);
        return;
      }
    } catch (error) {
      console.error('User login was unsuccessful:', error);
      setErrorMessage('Skontaktuj się z IT!');
      return;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        logowanie {!personsContext?.persons.first ? 'pierwszej' : 'drugiej'}{' '}
        osoby
      </span>
      <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
        <div className='flex w-11/12 flex-col items-center justify-center gap-3'>
          {message || errorMessage ? (
            <div className='flex flex-col items-center justify-center space-y-4'>
              {message && (
                <div className='rounded bg-bruss p-2 text-center text-slate-100'>
                  {message}
                </div>
              )}
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
              type='string'
              name='personalNumber'
              placeholder='nr personalny'
              value={formState.personalNumber}
              onChange={handleInputChange}
              autoFocus
              ref={personalNumberInputRef}
            />
            <input
              className='w-9/12 rounded border-slate-700 bg-white p-1 text-center shadow-sm   dark:bg-slate-900 dark:outline-slate-600'
              type='password'
              name='password'
              placeholder='hasło'
              value={formState.password}
              onChange={handleInputChange}
            />
            <button
              type='submit'
              className={clsx(
                `w-5/12 max-w-lg rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss`,
                { 'animate-pulse': isPending === true },
              )}
              disabled={isPending}
            >
              {isPending ? 'logowanie...' : 'zaloguj'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
