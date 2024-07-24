'use client';

import { useState, useEffect, useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import {
  findLowestFreeCardNumber,
  getExistingCards,
  getCardWarehouseAndSector,
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
  const [isPendingCardData, setIsPendingCardData] = useState(false);
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<string | null>(null);
  const [sector, setSector] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [existingCards, setExistingCards] = useState<Option[]>([]);

  useEffect(() => {
    (async () => {
      if (personsContext?.persons?.first && personsContext?.persons.second) {
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
    { value: '000', label: '000 - Produkcja + Magazyn' },
    { value: '035', label: '035 - stal niepowleczona z Chin' },
    { value: '054', label: '054 - magazyn zablokowany JAKOŚĆ' },
    { value: '055', label: '055 - magazyn zablokowany GTM' },
    { value: '111', label: '111 - magazyn LAUNCH' },
    { value: '222', label: '222 - magazyn zablokowany PRODUKCJA' },
    // { value: 999, label: '999 - WIP' },
  ];

  const sectorsSelectOptions = [
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2 Powlekanie + Chemia' },
    { value: 'S3', label: 'S3' },
    { value: 'S4', label: 'S4' },
    { value: 'S5', label: 'S5' },
    { value: 'S6', label: 'S6' },
    { value: 'S7', label: 'S7' },
    { value: 'S8', label: 'S8' },
    { value: 'S9', label: 'S9' },
    { value: 'S10', label: 'S10' },
    { value: 'GUMA', label: 'GUMA' },
    { value: 'Ważenie Baffli', label: 'Ważenie Baffli' },
    { value: 'Las Vegas', label: 'Las Vegas' },
    { value: 'S900', label: 'S900' },
    { value: 'CTM', label: 'CTM' },
    { value: '222', label: '222' },
    { value: '054', label: '054' },
    { value: 'Sedia', label: 'Sedia' },
    { value: 'GTM - Gizycka 9', label: 'GTM - Gizycka 9' },
    { value: 'GTM - Kolejowa', label: 'GTM - Kolejowa' },
  ];

  const selectedWarehauseOption = warehouseSelectOptions.find(
    (option) => option.value === warehouse,
  );

  const selectedSectorOption = sectorsSelectOptions.find(
    (option) => option.value === sector,
  );

  const handleWarehouseSelectChange = (
    selectedWarehauseOption: Option | null,
  ) => {
    if (selectedWarehauseOption) {
      setWarehouse(selectedWarehauseOption.value);
    }
  };

  const handleSectorSelectChange = (selectedSectorOption: Option | null) => {
    if (selectedSectorOption) {
      setSector(selectedSectorOption.value);
    }
  };

  const newCard = async () => {
    if (!warehouse || !sector) {
      setErrorMessage('Nie wybrano obszaru lub sektoru!');
      return;
    }
    try {
      setIsPendingNewCard(true);
      if (personsContext?.persons?.first && personsContext?.persons.second) {
        const number = await findLowestFreeCardNumber();
        const res = await reserveCard(
          number,
          personsContext.persons,
          warehouse,
          sector,
        );
        if (res == 'reserved') {
          inventoryContext?.setInventory((prevState) => ({
            ...prevState,
            card: number,
            warehouse: warehouse,
            sector: sector,
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

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber) {
      try {
        setIsPendingCardData(true);
        const cardNumberAsNumber = Number(cardNumber);
        const card = await getCardWarehouseAndSector(cardNumberAsNumber);
        inventoryContext?.setInventory((prevState) => ({
          ...prevState,
          card: parseInt(cardNumber),
          position: null,
          warehouse: card?.warehouse,
          sector: card?.sector,
        }));
        return;
      } catch (error) {
        console.error('Failed card data fetching:', error);
        setErrorMessage('Skontaktuj się z IT!');
        return;
      } finally {
        setIsPendingCardData(false);
      }
    }
    setErrorMessage('Nie wybrano karty!');
  };

  return (
    <>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100 sm:text-base lg:text-lg'>
        wybór karty
      </span>
      <div className='flex w-11/12 max-w-2xl justify-center rounded bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800 sm:pb-4 sm:pt-4'>
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
            options={warehouseSelectOptions}
            value={selectedWarehauseOption}
            onChange={handleWarehouseSelectChange}
            placeholder={'wybierz obszar dla nowej karty'}
          />

          <Select
            options={sectorsSelectOptions}
            value={selectedSectorOption}
            onChange={handleSectorSelectChange}
            placeholder={'wybierz sektor dla nowej karty'}
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

          <div className='mt-2 flex w-full justify-center space-x-4'>
            <button
              type='button'
              onClick={newCard}
              className={clsx(
                'w-1/2 rounded bg-slate-200 p-2 text-center text-sm font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600 sm:text-base lg:text-lg',
                { 'animate-pulse': isPendingNewCard === true },
              )}
            >
              {isPendingNewCard ? 'tworzenie karty' : 'nowa karta'}
            </button>

            <button
              onClick={handleConfirm}
              className='w-1/2 rounded bg-slate-200 text-center text-sm font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss sm:text-base lg:text-lg'
            >
              {isPendingCardData ? 'pobieranie danych' : 'wybierz kartę'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
