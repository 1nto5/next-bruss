'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FindLowestFreeCardNumber,
  GetExistingCards,
  ReserveCard,
  GetAllPositions,
  GetIdentifierCardNumberAndPositionNumber,
} from '../actions';
import { useSession } from 'next-auth/react';
import Select from './Select';
import Loader from './Loader';

type Option = {
  value: string;
  label: string;
};

export default function CardChooser() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [existingCards, setExistingCards] = useState<Option[]>([]);
  const [positionIdentifier, setPositionIdentifier] = useState<string | null>(
    null,
  );
  const [existingPositions, setExistingPositions] = useState<Option[]>([]);

  const errorSetter = (message: string) => {
    setErrorMessage(message);
    setMessage(null);
  };

  const messageSetter = (message: string) => {
    setMessage(message);
    setErrorMessage(null);
  };

  useEffect(() => {
    async function fetchExistingNumbers() {
      if (session?.user.email && session?.user.roles) {
        const cards = await GetExistingCards(session.user.email);
        setExistingCards(cards);
      }
    }
    fetchExistingNumbers();
    async function getAllPositions() {
      const positons = await GetAllPositions();
      setExistingPositions(positons);
    }
    if (session?.user?.roles?.includes('inventory_aprover')) {
      getAllPositions();
    }
  }, [session?.user.email, session?.user?.roles]);

  const selectedCardOption = existingCards.find(
    (option) => option.value === cardNumber,
  );

  const selectedPositionOption = existingPositions.find(
    (option) => option.value === positionIdentifier,
  );

  const handleCardSelectChange = (selectedCardOption: Option | null) => {
    if (selectedCardOption) {
      setCardNumber(selectedCardOption.value);
    }
  };

  const handlePositionSelectChange = (
    selectedPositionOption: Option | null,
  ) => {
    if (selectedPositionOption) {
      setPositionIdentifier(selectedPositionOption.value);
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

  const reserveCard = () => {
    startTransition(async () => {
      if (!warehouse) {
        setErrorMessage('Warehause not selected!');
        return;
      }
      if (session?.user?.email) {
        const number = await FindLowestFreeCardNumber();
        const res = await ReserveCard(number, session?.user.email, warehouse);
        if (res == 'reserved') {
          router.push(`${pathname}/card=${String(number)}`);
          return;
        }
        errorSetter(`Please contact IT!`);
        return;
      }
    });
  };

  const handleConfirm = async (e: React.FormEvent) => {
    if (cardNumber) {
      router.push(`${pathname}/card=${cardNumber}`);
      return;
    }
    let positionCardNumber: string | undefined;
    let positionNumber: string | undefined;
    if (positionIdentifier) {
      startTransition(async () => {
        const data = await GetIdentifierCardNumberAndPositionNumber(
          positionIdentifier,
        );
        if (data === 'not found') {
          errorSetter('Position not found!');
          return;
        }
        positionCardNumber = data.cardNumber;
        positionNumber = data.positionNumber;

        if (positionCardNumber && positionNumber) {
          router.push(
            `${pathname}/card=${positionCardNumber}/position=${positionNumber}`,
          );
          return;
        }
      });
    }
    session?.user.roles?.includes('inventory_aprover')
      ? setErrorMessage('Card or position not selected!')
      : setErrorMessage('Card not selected!');
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        card chooser
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
            placeholder={'select existing card'}
          />

          <Select
            options={warehouseSelectOptions}
            value={selectedWarehauseOption}
            onChange={handleWarehouseSelectChange}
            placeholder={'select warehouse'}
          />

          {session?.user.roles?.includes('inventory_aprover') && (
            <Select
              options={existingPositions}
              value={selectedPositionOption}
              onChange={handlePositionSelectChange}
              placeholder={'search position'}
            />
          )}

          <div className=' flex w-full justify-center space-x-2'>
            <button
              type='button'
              onClick={() => reserveCard()}
              className='w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600'
            >
              new card
            </button>

            <button
              onClick={handleConfirm}
              className='w-1/2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
