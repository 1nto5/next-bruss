'use client';

import { cn } from '@/lib/cn';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import { OvertimeType } from '../../lib/production-overtime-types';

export const columns: ColumnDef<OvertimeType>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      return (
        <div
          className={cn(
            status === 'pending' && 'animate-pulse font-bold text-red-500',
            status === 'approved' && 'font-bold text-green-500',
            status === 'rejected' && 'font-bold',
          )}
        >
          {status === 'pending' && 'Oczekuje'}
          {status === 'approved' && 'Zatwierdzony'}
          {status === 'rejected' && 'Odrzucony'}
        </div>
      );
    },
  },
  {
    accessorKey: 'approved',
    header: 'Zatwierdzony',
    cell: ({ row }) => {
      const approved = row.getValue('approved');
      const approvedAtLocaleString = row.original.approvedAtLocaleString;
      return <div>{approved ? `${approvedAtLocaleString}` : '-'}</div>;
    },
  },
  {
    accessorKey: 'fromLocaleString',
    header: 'Od',
  },
  {
    accessorKey: 'toLocaleString',
    header: 'Do',
  },
  {
    accessorKey: 'employees',
    header: 'Pracownicy',
    cell: ({ row }) => {
      const employees = row.getValue('employees');
      return <div>{Array.isArray(employees) ? employees.length : 0}</div>;
    },
  },
  {
    accessorKey: 'reason',
    header: 'Uzasadnienie',
    cell: ({ row }) => {
      const reason = row.getValue('reason');
      return <div className='w-[250px] text-justify'>{reason as string}</div>;
    },
  },
  {
    accessorKey: 'note',
    header: 'Dod. info.',
    cell: ({ row }) => {
      const note = row.getValue('note');
      return <div className='w-[250px] text-justify'>{note as string}</div>;
    },
  },
  {
    accessorKey: 'requestedAtLocaleString',
    header: 'Zlecenie wystawione',
  },
  {
    accessorKey: 'requestedBy',
    header: 'Wystawił',
    cell: ({ row }) => {
      const requestedBy = row.getValue('requestedBy');
      return (
        <div className='whitespace-nowrap'>
          {extractNameFromEmail(requestedBy as string)}
        </div>
      );
    },
  },
  {
    accessorKey: 'editedAtLocaleString',
    header: 'Ostatnia zmiana',
  },
];
