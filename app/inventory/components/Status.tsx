'use client';

import {
  StatusBox,
  BoxSeparatorInventory,
} from '@/app/components/StatusElements';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import formatEmailToName from '@/lib/utils/inventory/formatEmailToName';

export default function Status() {
  const pathname = usePathname();
  const matchesCard = pathname.match(/card=(\d+)/);
  const matchesPosition = pathname.match(/position=(\d+)/);
  const card = matchesCard ? String(matchesCard[1]) : '-';
  const position = matchesPosition ? String(matchesPosition[1]) : '-';
  const { data: session } = useSession();
  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-2 pt-2 shadow-md dark:bg-slate-800'>
      <StatusBox
        boxName='user:'
        value={formatEmailToName(
          session?.user?.email ?? 'Unknown.User@bruss-group.com',
        )}
      />
      <BoxSeparatorInventory />
      <StatusBox boxName='card:' value={card ?? '-'} />
      <BoxSeparatorInventory />
      <StatusBox boxName='position:' value={position ?? '-'} />
    </div>
  );
}
