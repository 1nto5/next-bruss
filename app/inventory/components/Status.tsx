'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import { BoxSeparatorInventory } from '@/app/components/old_StatusElements';
import StatusBox from '@/app/components/StatusBox';

export default function Status() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  if (!personsContext?.persons?.first || !personsContext.persons.second) {
    return null;
  }

  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='zalogowani:'
        value={`${personsContext?.persons?.first} + ${personsContext.persons.second}`}
        width='w-2/4'
      />
      <BoxSeparatorInventory />
      <StatusBox
        name='karta:'
        value={inventoryContext?.inventory.card ?? 'brak'}
        width='w-1/4'
      />
      <BoxSeparatorInventory />
      <StatusBox
        name='pozycja:'
        value={inventoryContext?.inventory.position ?? 'brak'}
        width='w-1/4'
      />
    </div>
  );
}
