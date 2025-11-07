'use client';

import { PositionType } from '@/app/[lang]/inventory/lib/types';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Check } from 'lucide-react';
import EditPositionDialog from '../components/edit-position-dialog';
import { Dictionary } from '../lib/dict';

export const createPositionsColumns = (dict: Dictionary): ColumnDef<PositionType>[] => [
  {
    accessorKey: 'position',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dict.positions.columns.positionNumber}
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
    header: dict.positions.columns.id,
  },
  {
    id: 'actions',
    header: dict.positions.columns.edit,
    cell: ({ row }) => {
      return <EditPositionDialog position={row.original} dict={dict} />;
    },
  },
  {
    accessorKey: 'articleName',
    header: dict.positions.columns.article,
    cell: ({ row }) => {
      const articleName = row.original.articleName;
      const articleNumber = row.original.articleNumber;
      return <div className='text-nowrap'>{articleName}</div>;
    },
  },
  {
    accessorKey: 'articleNumber',
    header: dict.positions.columns.articleNumber,
  },
  {
    accessorKey: 'quantity',
    header: dict.positions.columns.quantity,
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const unit = row.original.unit;
      return (
        <div className='text-nowrap'>
          {quantity} {unit}
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      return row.getValue(columnId) === Number(value);
    },
  },
  {
    accessorKey: 'wip',
    header: dict.positions.columns.wip,
    cell: ({ row }) => {
      const wip = row.original.wip;
      return wip ? <Check /> : null;
    },
  },
  {
    accessorKey: 'approver',
    header: dict.positions.columns.approved,
  },
  {
    accessorKey: 'comment',
    header: dict.positions.columns.comment,
    cell: ({ row }) => {
      const comment = row.getValue('comment');
      return <div className='w-[300px]'>{comment as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'bin',
    header: dict.positions.columns.storageBin,
    cell: ({ row }) => {
      const bin = row.original.bin;
      return <div className='text-nowrap'>{bin && bin.toUpperCase()}</div>;
    },
  },
  {
    accessorKey: 'deliveryDateLocaleString',
    header: dict.positions.columns.deliveryDate,
  },

  {
    accessorKey: 'timeLocaleString',
    header: dict.positions.columns.lastChange,
  },
];
