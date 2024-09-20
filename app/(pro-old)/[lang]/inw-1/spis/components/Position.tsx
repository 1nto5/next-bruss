'use client';

import { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import {
  getExistingPositions,
  findLowestFreePosition,
  checkIsFull,
} from '../actions';
import Select from './Select';

type Option = {
  value: number;
  label: string;
};

export default function Position() {
  const personsContext = useContext(PersonsContext);
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
      if (
        inventoryContext?.inventory?.card &&
        personsContext?.persons?.first &&
        personsContext?.persons.second
      ) {
        setIsPendingExistingPositions(true);
        try {
          const res = await getExistingPositions(
            inventoryContext?.inventory.card,
            personsContext?.persons,
          );

          if (res === 'no access') {
            inventoryContext.setInventory((prevState) => ({
              ...prevState,
              card: null,
              position: null,
            }));
            return;
          }
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
  }, [inventoryContext, personsContext?.persons]);

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

  const handleFirstFree = async () => {
    try {
      if (
        personsContext?.persons?.first &&
        personsContext.persons?.second &&
        inventoryContext?.inventory?.card
      ) {
        setIsPendingFirstFree(true);
        const res = await findLowestFreePosition(
          inventoryContext?.inventory.card,
        );
        if (res === 'full') {
          setErrorMessage('Karta jest pełna!');
          return;
        }
        if (res) {
          inventoryContext.setInventory((prevState) => ({
            ...prevState,
            position: res,
          }));
          return;
        }
        setErrorMessage(`Skontaktuj się z IT!`);
        return;
      }
    } catch (error) {
      console.error('Failed to find lowest free position:', error);
      setErrorMessage(`Skontaktuj się z IT!`);
    } finally {
      setIsPendingFirstFree(false);
    }
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
        <div className='flex w-11/12 flex-col gap-2 sm:gap-3'>
          {message || errorMessage ? (
            <div className='flex flex-col items-center justify-center space-y-2 text-sm sm:space-y-4 sm:text-base lg:text-lg'>
              {message && (
                <div className='rounded bg-bruss p-2 text-center text-slate-100'>
                  {message}
                </div>
              )}
              {errorMessage && (
                <div className='rounded bg-red-500 p-2 text-center text-sm text-slate-100 dark:bg-red-700 sm:text-base lg:text-lg'>
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
            {!fullCard && (
              <button
                type='button'
                onClick={handleFirstFree}
                className={clsx(
                  'w-1/2 rounded bg-slate-200 p-2 text-center text-sm font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600 sm:text-base lg:text-lg',
                  { 'animate-pulse': isPendingFirstFree === true },
                )}
              >
                {isPendingFirstFree
                  ? 'wyszukiwanie pozycji'
                  : existingPositionNumbers.length > 0
                  ? 'pierwsza wolna'
                  : 'rozpocznij kartę'}
              </button>
            )}
            {existingPositionNumbers.length > 0 && (
              <button
                type='submit'
                onClick={handleConfirm}
                className='w-1/2 rounded bg-slate-200 text-center text-sm font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss sm:text-base lg:text-lg'
              >
                potwierdź
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
