'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import StatusBox from '@/app/(persons)/components/StatusBox';
import { shortenLastName } from '../../../../lib/utils/nameFormat';

export default function Status() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  if (!personsContext?.persons?.first || !personsContext.persons.second) {
    return null;
  }

  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='zalogowany 1:'
        value={`${personsContext?.persons?.first} (${shortenLastName(
          personsContext?.persons?.nameFirst ?? '',
        )})`}
        width='w-2/6'
      />

      <StatusBox
        name='zalogowany 2:'
        value={`${personsContext?.persons?.second} (${shortenLastName(
          personsContext?.persons?.nameSecond ?? '',
        )})`}
        width='w-2/6'
      />

      <StatusBox
        name='karta/pozycja:'
        value={
          inventoryContext?.inventory.card
            ? `${inventoryContext.inventory.card.toString().padStart(3, '0')}/${
                inventoryContext.inventory.position
                  ? inventoryContext.inventory.position
                      .toString()
                      .padStart(2, '0')
                  : 'brak'
              }`
            : 'brak'
        }
        width='w-1/6'
      />

      <StatusBox
        name='obszar/sektor:'
        value={
          inventoryContext?.inventory.warehouse &&
          inventoryContext?.inventory.sector
            ? `${inventoryContext?.inventory.warehouse}/${inventoryContext?.inventory.sector}`
            : 'brak'
        }
        width='w-1/6'
      />
    </div>
  );
}
