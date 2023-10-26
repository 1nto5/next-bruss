'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  GetExistingPositions,
  FindLowestFreePosition,
  CheckIsFull,
} from '../actions';
import { useSession } from 'next-auth/react';
import Loader from './Loader';
import Select from './Select';

type Option = {
  value: number;
  label: string;
};

//TODO: random position for approver

export default function PositionChooser() {
  const router = useRouter();
  const pathname = usePathname();
  if (!/\/card=\d+$/.test(pathname)) {
    router.push('/inventory');
  }
  const matches = pathname.match(/card=(\d+)/);
  const cardNumber = matches ? Number(matches[1]) : null;
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [existingPositionNumbers, setExistingPositionNumbers] = useState<
    Option[]
  >([]);
  const [positionNumber, setPositionNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullCard, setFullCard] = useState(false);

  const errorSetter = (message: string) => {
    setErrorMessage(message);
    setMessage(null);
  };

  const messageSetter = (message: string) => {
    setMessage(message);
    setErrorMessage(null);
  };

  useEffect(() => {
    startTransition(async () => {
      if (session?.user?.email && cardNumber) {
        const positions = await GetExistingPositions(
          cardNumber,
          session.user.email,
        );
        if (positions === 'no access') {
          router.push('/inventory');
          return;
        }
        if (positions) {
          setExistingPositionNumbers(positions);
        } else {
          errorSetter('Please contact IT!');
        }
        const full = await CheckIsFull(cardNumber);
        if (full) {
          setFullCard(true);
        }
      }
    });
  }, [cardNumber, router, session?.user.email]);

  const selectedOption = existingPositionNumbers.find(
    (option) => option.value === positionNumber,
  );

  const handleConfirm = (e: React.FormEvent) => {
    if (positionNumber) {
      router.push(`${pathname}/position=${positionNumber}`);
      return;
    }
    errorSetter('Position not selected!');
  };

  const handleFirstFree = () => {
    startTransition(async () => {
      if (session?.user?.email && cardNumber) {
        const res = await FindLowestFreePosition(cardNumber);
        if (res) {
          router.push(`${pathname}/position=${String(res)}`);
          return;
        }
        errorSetter(`Please contact IT!`);
        return;
      }
    });
  };

  const handleSelectChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setPositionNumber(selectedOption.value);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        choose position
      </span>
      <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
        <div className='flex w-11/12 flex-col gap-3'>
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
          {existingPositionNumbers.length > 0 && (
            <Select
              options={existingPositionNumbers}
              value={selectedOption}
              onChange={handleSelectChange}
              placeholder={'select position'}
            />
          )}

          <div className='flex w-full justify-center space-x-2'>
            {!fullCard && (
              <button
                type='button'
                onClick={() => handleFirstFree()}
                className='w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600'
              >
                {existingPositionNumbers.length > 0
                  ? 'first free'
                  : 'start card'}
              </button>
            )}
            {existingPositionNumbers.length > 0 && (
              <button
                type='submit'
                onClick={handleConfirm}
                className='w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
              >
                confirm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
