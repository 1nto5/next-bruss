'use client';

import { CardTableDataType } from '../lib/types';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, List } from 'lucide-react';
import LocalizedLink from '@/components/localized-link';
import { Dictionary } from '../lib/dict';

export function createCardsColumns(dict: Dictionary): ColumnDef<CardTableDataType>[] {
  return [
    {
      accessorKey: 'sector',
      header: dict.cards.sector,
      filterFn: (row, columnId, value: string) => {
        if (!value) return true;
        const selectedValues = value.split(',');
        const rowValue = row.getValue(columnId) as string;
        return selectedValues.includes(rowValue);
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
            {dict.cards.number}
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
      header: dict.cards.positions,
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
      header: dict.cards.creators,
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
            {dict.cards.positionsCount}
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
            {dict.cards.approvedCount}
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
      header: dict.cards.warehouse,
      filterFn: (row, columnId, value: string) => {
        if (!value) return true;
        const selectedValues = value.split(',');
        const rowValue = row.getValue(columnId) as string;
        return selectedValues.includes(rowValue);
      },
    },
  ];
}
