'use client';

import { CardTableDataType } from '@/app/[lang]/inventory/lib/types';
import { Dictionary } from '@/app/[lang]/inventory/lib/dict';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, List } from 'lucide-react';
import LocalizedLink from '@/components/localized-link';

export const createCardsColumns = (dict: Dictionary): ColumnDef<CardTableDataType>[] => [
  {
    accessorKey: 'sector',
    header: dict.cards.columns.sector,
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
          {dict.cards.columns.number}
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
    header: dict.cards.columns.cardPosition,
    cell: ({ row }) => {
      const cardNumber = row.original.number;
      return (
        <LocalizedLink href={`/inventory/${cardNumber}`}>
          <Button size='sm' type='button' variant='outline'>
            <List />
          </Button>
        </LocalizedLink>
      );
    },
  },
  {
    accessorKey: 'creators',
    header: dict.cards.columns.creators,
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
          {dict.cards.columns.positions}
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
          {dict.cards.columns.approvedPositions}
          <ArrowUpDown className='ml-2' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const approvedPositions = row.original.approvedPositions;
      const totalPositions = row.original.positionsLength;
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
    header: dict.cards.columns.warehouse,
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === value;
    },
  },
];
