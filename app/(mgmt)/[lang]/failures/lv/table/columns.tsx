'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FailureType } from '@/lib/z/failure';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import EditFailureDialog from '../components/edit-failure-dialog';

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
      return <div className='w-[200px]'>{failure as React.ReactNode}</div>;
    },
  },

  {
    id: 'actions',
    header: 'Edytuj',

    cell: ({ row }) => {
      const failure = row.original;

      return <EditFailureDialog failure={failure} />;
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
