'use client';

import { CardTableDataType } from '@/app/(mgmt)/[lang]/inw-2/zatwierdz/lib/types';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, List } from 'lucide-react';
import Link from 'next/link';

export const cardsColumns: ColumnDef<CardTableDataType>[] = [
  {
    accessorKey: 'sector',
    header: 'Sektor',
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === value;
    },
  },
  {
    accessorKey: 'number',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Numer
          <ArrowUpDown className='ml-2' />
        </Button>
      );
    },
    filterFn: 'includesString',
    cell: ({ row }) => {
      const cardNumber = row.original.number;
      return <div className='text-center'>{cardNumber}</div>;
    },
  },
  {
    id: 'actions',
    header: 'Pozycja na karcie',
    cell: ({ row }) => {
      const cardNumber = row.original.number;
      return (
        <Link href={`/inw-2/zatwierdz/${cardNumber}`}>
          <Button size='sm' type='button' variant='outline'>
            <List />
          </Button>
        </Link>
      );
    },
  },
  {
    accessorKey: 'creators',
    header: 'Spisujący',
    filterFn: 'includesString',

    cell: ({ row }) => {
      const creators = row.original.creators;
      return <span className='text-nowrap'>{creators.join(', ')}</span>;
    },
  },
  {
    accessorKey: 'positionsLength',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Poz.
          <ArrowUpDown className='ml-2' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const positionsLength = row.original.positionsLength;
      return <div className='text-center'>{positionsLength}</div>;
    },
  },
  {
    accessorKey: 'approvedPositions',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Zatw. poz.
          <ArrowUpDown className='ml-2' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const approvedPositions = row.original.approvedPositions;
      const totalPositions = row.original.positionsLength;
      // Jeśli łączna liczba pozycji 3 lub mniej, nie podświetlaj gdy jest zatwierdzona przynajmniej jedna
      // Gdy więcej niż 3, podświetlaj jeśli zatwierdzonych mniej niż 3
      const shouldHighlight =
        totalPositions <= 3 ? approvedPositions === 0 : approvedPositions < 3;

      return (
        <div
          className={`text-center ${shouldHighlight ? 'animate-pulse font-bold text-red-500' : ''}`}
        >
          {approvedPositions}
        </div>
      );
    },
  },
  {
    accessorKey: 'warehouse',
    header: 'Magazyn',
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === value;
    },
  },
];
