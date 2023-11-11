'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import { BoxSeparatorInventory } from '@/app/components/old_StatusElements';
import StatusBox from '@/app/components/StatusBox';
import { shortenLastName } from '../../../lib/utils/nameFormat';

export default function Status() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  if (!personsContext?.persons?.first || !personsContext.persons.second) {
    return null;
  }

  return (
    <div className=' w-1/ flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='zalogowany 1:'
        value={`${personsContext?.persons?.first} (${shortenLastName(
          personsContext?.persons?.nameFirst ?? '',
        )})`}
        width='w-2/6'
      />
      <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
      <StatusBox
        name='zalogowany 2:'
        value={`${personsContext?.persons?.second} (${shortenLastName(
          personsContext?.persons?.nameSecond ?? '',
        )})`}
        width='w-2/6'
      />
      <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
      <StatusBox
        name='karta:'
        value={inventoryContext?.inventory.card ?? 'brak'}
        width='w-1/6'
      />
      <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
      <StatusBox
        name='pozycja:'
        value={inventoryContext?.inventory.position ?? 'brak'}
        width='w-1/6'
      />
    </div>
  );
}
