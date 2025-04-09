'use client';

import { Button } from '@/components/ui/button';
import { PositionType } from '@/lib/types/inventory';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Check } from 'lucide-react';
import EditPositionDialog from '../../components/edit-position-dialog';

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
    id: 'actions',
    header: 'Edycja',
    cell: ({ row }) => {
      return <EditPositionDialog position={row.original} />;
    },
  },
  {
    accessorKey: 'articleName',
    header: 'Art.',
    cell: ({ row }) => {
      const articleName = row.original.articleName;
      const articleNumber = row.original.articleNumber;
      return <div className='text-nowrap'>{articleName}</div>;
    },
  },
  {
    accessorKey: 'articleNumber',
    header: 'Nr art.',
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
    accessorKey: 'comment',
    header: 'Komentarz',
    cell: ({ row }) => {
      const comment = row.getValue('comment');
      return <div className='w-[300px]'>{comment as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'bin',
    header: 'Storage Bin',
    cell: ({ row }) => {
      const bin = row.original.bin;
      return <div className='text-nowrap'>{bin && bin.toUpperCase()}</div>;
    },
  },
  {
    accessorKey: 'deliveryDateLocaleString',
    header: 'Data dostawy',
  },
  {
    accessorKey: 'timeLocaleString',
    header: 'Ostatnia zmiana',
  },
];
