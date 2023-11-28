'use client';

import { useSession } from 'next-auth/react';
import { useContext } from 'react';
import { InventoryContext } from '../lib/InventoryContext';
import StatusBox from '@/app/components/StatusBox';
import { formatEmailToName } from '../lib/utils/nameFormat';

export default function Status() {
  const { data: session } = useSession();
  const inventoryContext = useContext(InventoryContext);

  return (
    <div className=' w-1/ flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='zalogowany:'
        value={formatEmailToName(
          session?.user?.email ?? 'Unknown.User@bruss-group.com',
        )}
        width='w-1/2'
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
        width='w-1/2'
        separator={false}
      />
    </div>
  );
}
