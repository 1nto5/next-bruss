'use client';

import { useState, useEffect } from 'react';
import { getSession } from '@/app/(users)/auth/actions';
import { Session } from 'next-auth';
import { useContext } from 'react';
import { InventoryContext } from '../lib/InventoryContext';
import StatusBox from '@/app/(persons)/components/StatusBox';
import { formatEmailToName } from '../lib/utils/nameFormat';

export default function Status() {
  const [session, setSession] = useState<Session | null>(null);
  const [isPendingSession, setIsPendingSession] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSession();
        // console.log('session: ', sessionData?.user);
        setSession(sessionData);
      } catch (error) {
        console.log('Session fetching error: ', error);
      } finally {
        setIsPendingSession(false);
      }
    };
    fetchSession();
  }, []);
  const inventoryContext = useContext(InventoryContext);

  return (
    <div className=' w-1/ flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='zalogowany:'
        value={formatEmailToName(
          session?.user?.email ?? 'Unknown.User@bruss-group.com',
        )}
        width='w-1/3'
      />

      {/* <StatusBox
        name='karta/pozycja:'
        value={
          inventoryContext?.inventory?.card
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
      /> */}
      <StatusBox
        name='karta:'
        value={
          inventoryContext?.inventory?.card
            ? inventoryContext?.inventory?.card.toString()
            : '-'
        }
        width='w-1/3'
      />

      <StatusBox
        name='poz.:'
        value={
          inventoryContext?.inventory?.position
            ? inventoryContext?.inventory?.position.toString()
            : '-'
        }
        width='w-1/3'
      />
    </div>
  );
}
