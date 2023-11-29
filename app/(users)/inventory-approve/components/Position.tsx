'use client';

import { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { InventoryContext } from '../lib/InventoryContext';
import { getExistingPositions, checkIsFull } from '../actions';
import Select from './Select';

type Option = {
  value: number;
  label: string;
};

export default function Position() {
  const inventoryContext = useContext(InventoryContext);
  const [isPendingExistingPositions, setIsPendingExistingPositions] =
    useState(false);
  const [isPendingFirstFree, setIsPendingFirstFree] = useState(false);
  const [existingPositionNumbers, setExistingPositionNumbers] = useState<
    Option[]
  >([]);
  const [positionNumber, setPositionNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullCard, setFullCard] = useState(false);

  useEffect(() => {
    (async () => {
      if (inventoryContext?.inventory.card) {
        setIsPendingExistingPositions(true);
        try {
          const res = await getExistingPositions(
            inventoryContext?.inventory.card,
          );

          console.log('res:', res);
          if (res) {
            setExistingPositionNumbers(res);
          } else {
            setErrorMessage('Skontaktuj się z IT!');
          }

          const full = await checkIsFull(inventoryContext?.inventory.card);
          if (full) {
            setFullCard(true);
          }
        } catch (error) {
          console.error('Error fetching existing positions:', error);
          setErrorMessage('Skontaktuj się z IT!');
        } finally {
          setIsPendingExistingPositions(false);
        }
      }
    })();
  }, [inventoryContext?.inventory.card]);

  const selectedOption = existingPositionNumbers.find(
    (option) => option.value === positionNumber,
  );

  const handleConfirm = (e: React.FormEvent) => {
    if (positionNumber) {
      inventoryContext?.setInventory((prevState) => ({
        ...prevState,
        position: positionNumber,
      }));
      return;
    }
    setErrorMessage('Pozycja nie została wybrana!');
  };

  const handleSelectChange = (selectedOption: Option | null) => {
    if (selectedOption) {
      setPositionNumber(selectedOption.value);
    }
  };

  return (
    <>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        wybór pozycji
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

          <Select
            options={existingPositionNumbers}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder={
              isPendingExistingPositions
                ? 'pobieranie pozycji'
                : existingPositionNumbers.length > 0
                ? 'wybierz pozycję'
                : 'brak pozycji - nowa karta'
            }
          />

          <div className='flex w-full justify-center space-x-2'>
            <button
              type='submit'
              onClick={handleConfirm}
              className='w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
            >
              potwierdź
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
