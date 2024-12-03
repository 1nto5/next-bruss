'use client';

import { FailureType } from '@/lib/z/failure';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<FailureType>[] = [
  {
    accessorKey: 'station',
    header: 'Stacja',
  },
  {
    accessorKey: 'failure',
    header: 'Awaria',
  },
  {
    accessorKey: 'from',
    header: 'Rozpoczęcie',
    cell: ({ row }) => {
      const from = row.getValue('from');
      return <div className='w-[150px]'>{from as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'to',
    header: 'Zakończenie',
    cell: ({ row }) => {
      const to = row.getValue('to');
      return <div className='w-[150px]'>{to as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'supervisor',
    header: 'Nadzorujący',
  },
  {
    accessorKey: 'responsible',
    header: 'Odpowiedzialny',
  },
  {
    accessorKey: 'solution',
    header: 'Rozwiązanie',
    // header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const solution = row.getValue('solution');
      return <div className='w-[300px]'>{solution as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Utworzono',
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      return <div className='w-[150px]'>{createdAt as React.ReactNode}</div>;
    },
  },
];
