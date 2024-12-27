'use client';

import { Button } from '@/components/ui/button';
import { PositionType } from '@/lib/types/inventory';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Check, List, Table } from 'lucide-react';

export const columns: ColumnDef<PositionType>[] = [
  {
    accessorKey: 'position',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Poz. nr
          <ArrowUpDown className='ml-2' />
        </Button>
      );
    },
    filterFn: 'includesString',
    cell: ({ row }) => {
      const position = row.original.position;
      return <div className='text-center'>{position}</div>;
    },
  },
  {
    accessorKey: 'identifier',
    header: 'Id',
  },
  {
    accessorKey: 'articleName',
    header: 'Artykuł',
    cell: ({ row }) => {
      const articleName = row.original.articleName;
      const articleNumber = row.original.articleNumber;
      return (
        <div className='text-nowrap'>
          {articleNumber} - {articleName}
        </div>
      );
    },
  },
  // export type PositionType = {
  //   position: number;
  //   identifier: string;
  //   time: string;
  //   articleNumber: string;
  //   articleName: string;
  //   quantity: number;
  //   unit: string;
  //   wip: boolean;
  //   approver: string;
  //   approvedAt: string;
  // };
  {
    accessorKey: 'quantity',
    header: 'Ilość',
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const unit = row.original.unit;
      return (
        <div className='text-nowrap'>
          {quantity} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: 'wip',
    header: 'WIP',
    cell: ({ row }) => {
      const wip = row.original.wip;
      return wip ? <Check /> : null;
    },
  },
  {
    accessorKey: 'approver',
    header: 'Zatwierdzono',
  },
  {
    accessorKey: 'timeLocaleString',
    header: 'Ostatnia zmiana',
  },
];
