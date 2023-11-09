'use client';

import { useState, useEffect, useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import {
  findLowestFreeCardNumber,
  getExistingCards,
  reserveCard,
} from '../actions';
import Select from './Select';
import clsx from 'clsx';

type Option = {
  value: string;
  label: string;
};

export default function Card() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);
  const [isPendingExistingCards, setIsPendingExistingCards] = useState(true);
  const [isPendingNewCard, setIsPendingNewCard] = useState(false);
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [existingCards, setExistingCards] = useState<Option[]>([]);

  useEffect(() => {
    (async () => {
      if (personsContext?.persons.first && personsContext?.persons.second) {
        setIsPendingExistingCards(true);
        try {
          const cards = await getExistingCards(personsContext.persons);
          setExistingCards(cards);
        } catch (error) {
          console.error('Error fetching existing cards:', error);
          setErrorMessage('Skontaktuj się z IT!');
        } finally {
          setIsPendingExistingCards(false);
        }
      }
    })();
  }, [personsContext?.persons]);

  const selectedCardOption = existingCards.find(
    (option) => option.value === cardNumber,
  );

  const handleCardSelectChange = (selectedCardOption: Option | null) => {
    if (selectedCardOption) {
      setCardNumber(selectedCardOption.value);
    }
  };

  const warehouseSelectOptions = [
    { value: '000', label: '000 - Rohstolfe und Fertigteile' },
    { value: '035', label: '035 - Metalteile Taicang' },
    { value: '054', label: '054 - Magazyn wstrzymanych' },
    { value: '055', label: '055 - Cz.zablokowane GTM' },
    { value: '111', label: '111 - Magazyn Launch' },
    { value: '222', label: '222 - Magazyn zablokowany produkcja' },
    // { value: 999, label: '999 - WIP' },
  ];

  const selectedWarehauseOption = warehouseSelectOptions.find(
    (option) => option.value === warehouse,
  );

  const handleWarehouseSelectChange = (
    selectedWarehauseOption: Option | null,
  ) => {
    if (selectedWarehauseOption) {
      setWarehouse(selectedWarehauseOption.value);
    }
  };

  const newCard = async () => {
    if (!warehouse) {
      setErrorMessage('Nie wybrano obszaru!');
      return;
    }
    try {
      setIsPendingNewCard(true);
      if (personsContext?.persons.first && personsContext?.persons.second) {
        const number = await findLowestFreeCardNumber();
        const res = await reserveCard(
          number,
          personsContext.persons,
          warehouse,
        );
        if (res == 'reserved') {
          inventoryContext?.setInventory((prevState) => ({
            ...prevState,
            card: number,
          }));
          return;
        }
        setErrorMessage(`Please contact IT!`);
        return;
      }
    } catch (error) {
      console.error('Failed card reservation:', error);
      setErrorMessage('Skontaktuj się z IT!');
      return;
    } finally {
      setIsPendingNewCard(false);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    if (cardNumber) {
      inventoryContext?.setInventory((prevState) => ({
        ...prevState,
        card: parseInt(cardNumber),
        position: null,
      }));
      return;
    }
    setErrorMessage('Nie wybrano karty!');
  };

  return (
    <>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        wybór karty
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
            options={warehouseSelectOptions}
            value={selectedWarehauseOption}
            onChange={handleWarehouseSelectChange}
            placeholder={'wybierz obszar dla nowej karty'}
          />
          <Select
            options={existingCards}
            value={selectedCardOption}
            onChange={handleCardSelectChange}
            placeholder={
              isPendingExistingCards
                ? 'pobieranie kart'
                : 'wybierz istniejącą kartę'
            }
          />

          <div className=' flex w-full justify-center space-x-2'>
            <button
              type='button'
              onClick={newCard}
              className={clsx(
                'w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600',
                { 'animate-pulse': isPendingNewCard === true },
              )}
            >
              {isPendingNewCard ? 'tworzenie karty' : 'nowa karta'}
            </button>

            <button
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
