'use client';

import { useState, FormEvent, useContext } from 'react';
import { PersonContext } from '../lib/PersonContext';
import { loginPerson } from '../actions';

import toast from 'react-hot-toast';
import { login } from '@/app/(persons)/[lang]/inventory/main/actions';

type NumberButtonProps = {
  onClick: () => void;
  value: number;
};

const NumberButton: React.FC<NumberButtonProps> = ({ onClick, value }) => (
  <button
    className='m-2 inline-block h-24 w-24 rounded bg-slate-100 text-center text-4xl text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
    onClick={onClick}
    type='button'
  >
    {value}
  </button>
);

const NumLogIn = () => {
  const [personalNumber, setPersonalNumber] = useState('');

  const personContext = useContext(PersonContext);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!personalNumber) {
      toast.error('Nie wpisano numeru!', { id: 'error' });
      return;
    }

    const res = await loginPerson(personalNumber);
    if (res) {
      personContext?.setPerson({
        number: personalNumber,
        name: res,
      });
      toast.success(`${personalNumber} zalogowany!`, { id: 'success' });
    } else {
      toast.error(`${personalNumber} nie istnieje!`, { id: 'error' });
    }
  };

  const handleClickNumber = (calcNum: number) => {
    setPersonalNumber(personalNumber + calcNum.toString());
  };

  const handleClickClear = () => {
    setPersonalNumber('');
  };

  return (
    <form
      className='mb-4 mt-4 flex flex-col items-center justify-center'
      onSubmit={handleLogin}
    >
      <input
        className='w-1/5 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-none focus:border-2 focus:border-solid focus:border-bruss dark:bg-slate-800'
        type='text'
        value={personalNumber}
        onChange={(e) => setPersonalNumber(e.target.value)}
        placeholder='nr personalny'
        autoFocus
      />
      <div className='mt-4'>
        <div>
          <NumberButton onClick={() => handleClickNumber(1)} value={1} />
          <NumberButton onClick={() => handleClickNumber(2)} value={2} />
          <NumberButton onClick={() => handleClickNumber(3)} value={3} />
        </div>
        <div>
          <NumberButton onClick={() => handleClickNumber(4)} value={4} />
          <NumberButton onClick={() => handleClickNumber(5)} value={5} />
          <NumberButton onClick={() => handleClickNumber(6)} value={6} />
        </div>
        <div>
          <NumberButton onClick={() => handleClickNumber(7)} value={7} />
          <NumberButton onClick={() => handleClickNumber(8)} value={8} />
          <NumberButton onClick={() => handleClickNumber(9)} value={9} />
        </div>
        <div>
          <button
            className='m-2 inline-block h-24 w-24 rounded bg-red-500 text-center text-4xl text-slate-50 shadow-sm hover:bg-red-700 dark:bg-red-800 dark:text-slate-100 dark:hover:bg-red-600'
            onClick={() => handleClickClear()}
            type='button'
          >
            C
          </button>
          <NumberButton onClick={() => handleClickNumber(0)} value={0} />
          <button
            className='m-2 h-24 w-24 rounded bg-bruss text-center text-4xl text-slate-50 shadow-sm hover:bg-green-700 dark:bg-green-800 dark:text-slate-100 dark:hover:bg-green-700'
            type='submit'
          >
            OK
          </button>
        </div>
      </div>
    </form>
  );
};

export default NumLogIn;
