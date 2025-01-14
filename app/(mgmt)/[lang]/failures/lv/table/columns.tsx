'use client';

import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import EditFailureDialog from '../components/edit-failure-dialog';
import EndFailureButton from '../components/end-failure-button';
import { FailureType } from '../lib/types-failures';

export const columns: ColumnDef<FailureType>[] = [
  {
    accessorKey: 'line',
    header: 'Linia',
    cell: ({ row }) => {
      const line = row.getValue('line');
      return (line as string).toUpperCase();
    },
  },
  {
    accessorKey: 'station',
    header: 'Stacja',
  },
  {
    accessorKey: 'failure',
    header: 'Awaria',
    cell: ({ row }) => {
      const failure = row.getValue('failure');
      const failureInProgress =
        row.getValue('fromLocaleString') && !row.getValue('toLocaleString');

      return (
        <div
          className={cn(
            'w-[200px]',
            !!failureInProgress && 'animate-pulse font-bold text-red-500',
          )}
        >
          {failure as React.ReactNode}
        </div>
      );
    },
  },

  {
    id: 'actions',
    header: 'Edytuj',

    cell: ({ row }) => {
      const failure = row.original;
      const createdAt = new Date(failure.createdAt);
      const isRecent =
        (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60) < 16;

      return !isRecent && failure.to && <EditFailureDialog failure={failure} />;
    },
  },
  {
    accessorKey: 'fromLocaleString',
    header: 'Rozpoczęcie',
    cell: ({ row }) => {
      const from = row.getValue('fromLocaleString');
      return <div className='w-[150px]'>{from as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'toLocaleString',
    header: 'Zakończenie',
    cell: ({ row }) => {
      const to = row.getValue('toLocaleString');
      const id = row.original._id;
      if (!to) {
        return (
          <div className='w-[150px]'>
            <EndFailureButton failureId={id} />
          </div>
        );
      }
      return <div className='w-[150px]'>{to as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'duration',
    header: 'Czas trwania (min)',
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
    accessorKey: 'comment',
    header: 'Komentarz',
    // header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const comment = row.getValue('comment');
      return <div className='w-[300px]'>{comment as React.ReactNode}</div>;
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
  {
    accessorKey: 'updatedAt',
    header: 'Ostania aktualizacja',
    cell: ({ row }) => {
      const updatedAt = row.getValue('updatedAt');
      return <div className='w-[150px]'>{updatedAt as React.ReactNode}</div>;
    },
  },
];
