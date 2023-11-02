'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import {
  StatusBox,
  BoxSeparatorInventory,
} from '@/app/components/StatusElements';

export default function Status() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  if (!personsContext?.persons?.first || !personsContext.persons.second) {
    return null;
  }

  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      {personsContext?.persons?.first && personsContext.persons.second && (
        <StatusBox
          boxName='zalogowani:'
          value={`${personsContext?.persons?.first} + ${personsContext.persons.second}`}
        />
      )}
      <BoxSeparatorInventory />
      <StatusBox
        boxName='karta:'
        value={inventoryContext?.inventory.card?.toString() ?? 'brak'}
      />
      <BoxSeparatorInventory />
      <StatusBox
        boxName='pozycja:'
        value={inventoryContext?.inventory.position?.toString() ?? 'brak'}
      />
    </div>
  );
}
