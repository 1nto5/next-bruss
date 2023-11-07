'use client';

import { useSession } from 'next-auth/react';
import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import StatusBox from '@/app/components/StatusBox';
import { formatEmailToName } from '../lib/utils/nameFormat';

export default function Status() {
  const { data: session } = useSession();
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  if (!personsContext?.persons?.first || !personsContext.persons.second) {
    return null;
  }

  return (
    <div className=' w-1/ flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='zalogowany:'
        value={formatEmailToName(
          session?.user?.email ?? 'Unknown.User@bruss-group.com',
        )}
        width='w-2/4'
      />
      <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
      <StatusBox
        name='karta:'
        value={inventoryContext?.inventory.card ?? 'brak'}
        width='w-1/4'
      />
      <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
      <StatusBox
        name='pozycja:'
        value={inventoryContext?.inventory.position ?? 'brak'}
        width='w-1/4'
      />
    </div>
  );
}
