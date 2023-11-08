'use client';

import { useState, useEffect, useContext } from 'react';
import { InventoryContext } from '../lib/InventoryContext';
import { getAllCards, getAllPositions } from '../actions';
import Select from './Select';
import clsx from 'clsx';

type Option = {
  value: string;
  label: string;
};

type PositionOption = {
  value: string;
  label: string;
  card: number;
  position: number;
};

export default function CardOrPosition() {
  const inventoryContext = useContext(InventoryContext);
  const [isPendingExistingCards, setIsPendingExistingCards] = useState(true);
  const [isPendingExistingPositions, setIsPendingExistingPositions] =
    useState(false);
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [existingCards, setExistingCards] = useState<Option[]>([]);
  const [existingPositions, setExistingPositions] = useState<PositionOption[]>(
    [],
  );
  const [positionIdentifier, setPositionIdentifier] = useState<string | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      setIsPendingExistingCards(true);
      try {
        const cards = await getAllCards();
        setExistingCards(cards);
      } catch (error) {
        console.error('Error fetching existing cards:', error);
        setErrorMessage('Skontaktuj się z IT!');
      } finally {
        setIsPendingExistingCards(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setIsPendingExistingPositions(true);
      try {
        const positions = await getAllPositions();
        setExistingPositions(positions);
      } catch (error) {
        console.error('Error fetching existing positins:', error);
        setErrorMessage('Skontaktuj się z IT!');
      } finally {
        setIsPendingExistingPositions(false);
      }
    })();
  }, []);

  const selectedCardOption = existingCards.find(
    (option) => option.value === cardNumber,
  );

  const handleCardSelectChange = (selectedCardOption: Option | null) => {
    if (selectedCardOption) {
      setCardNumber(selectedCardOption.value);
    }
  };

  const selectedPositionOption = existingPositions.find(
    (option) => option.value === positionIdentifier,
  );

  const handlePositionSelectChange = (
    selectedPositionOption: Option | null,
  ) => {
    if (selectedPositionOption) {
      setPositionIdentifier(selectedPositionOption.value);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (cardNumber) {
      inventoryContext?.setInventory((prevState) => ({
        ...prevState,
        card: parseInt(cardNumber),
        position: null,
      }));
    } else if (positionIdentifier) {
      const selectedOption = existingPositions.find(
        (option) => option.value === positionIdentifier,
      );

      if (selectedOption) {
        inventoryContext?.setInventory((prevState) => ({
          ...prevState,
          card: selectedOption.card,
          position: selectedOption.position,
        }));
      }
    } else {
      setErrorMessage('Nie wybrano karty ani pozycji!');
    }
  };

  return (
    <>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        wybór karty lub pozycji
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
            options={existingCards}
            value={selectedCardOption}
            onChange={handleCardSelectChange}
            placeholder={
              isPendingExistingCards
                ? 'pobieranie kart'
                : 'wybierz istniejącą kartę'
            }
          />
          <div className='flex justify-center'>
            <span className='text-center text-sm font-extralight'>lub</span>
          </div>
          <Select
            options={existingPositions}
            value={selectedPositionOption}
            onChange={handlePositionSelectChange}
            placeholder={
              isPendingExistingPositions
                ? 'pobieranie pozycji'
                : 'wybierz istniejącą pozycję'
            }
          />
          <div className=' flex w-full justify-center space-x-2'>
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
