'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import StatusBox from '@/app/(pro-old)/[lang]/components/StatusBox';
import { shortenLastName } from '../../../../../../lib/utils/nameFormat';

export default function Status() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  if (!personsContext?.persons?.first || !personsContext.persons.second) {
    return null;
  }

  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800 '>
      <StatusBox
        name='os. 1:'
        value={personsContext?.persons?.first}
        width='w-1/4'
      />

      <StatusBox
        name='os. 2:'
        value={personsContext?.persons?.second}
        width='w-1/4'
      />

      <StatusBox
        name='karta:'
        value={
          inventoryContext?.inventory?.card
            ? inventoryContext?.inventory?.card.toString()
            : '-'
        }
        width='w-1/4'
      />

      <StatusBox
        name='poz.:'
        value={
          inventoryContext?.inventory?.position
            ? inventoryContext?.inventory?.position.toString()
            : '-'
        }
        width='w-1/4'
      />

      <StatusBox
        name='sektor:'
        value={
          inventoryContext?.inventory?.sector
            ? inventoryContext.inventory.sector.split(' ')[0] + ''
            : '-'
        }
        width='w-1/4'
      />

      <StatusBox
        name='obszar:'
        value={inventoryContext?.inventory?.warehouse ?? '-'}
        width='w-1/4'
        separator={false}
      />
    </div>
  );
}
