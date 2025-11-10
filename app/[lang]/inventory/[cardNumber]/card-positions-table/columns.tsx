'use client';

import { PositionType } from '@/app/[lang]/inventory/lib/types';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Check, Pencil } from 'lucide-react';
import { Dictionary } from '../../lib/dict';
import LocalizedLink from '@/components/localized-link';
import { usePathname, useSearchParams } from 'next/navigation';

const EditPositionButton = ({ position }: { position: PositionType }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build return URL with current filters
  // For card detail view, return to the same card page
  const currentParams = new URLSearchParams(searchParams);
  const returnUrl = pathname;

  // Use catch-all route: identifier "162/1" works directly in URL
  const editUrl = `/inventory/positions/${position.identifier}/edit?returnUrl=${encodeURIComponent(returnUrl)}&returnTab=cards`;

  return (
    <LocalizedLink href={editUrl}>
      <Button size='sm' variant='outline'>
        <Pencil />
      </Button>
    </LocalizedLink>
  );
};

export const createColumns = (dict: Dictionary): ColumnDef<PositionType>[] => [
  {
    accessorKey: 'position',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dict.cardPositions.columns.positionNumber}
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
    header: dict.cardPositions.columns.id,
  },
  {
    id: 'actions',
    header: dict.cardPositions.columns.edit,
    cell: ({ row }) => {
      return <EditPositionButton position={row.original} />;
    },
  },
  {
    accessorKey: 'articleName',
    header: dict.cardPositions.columns.article,
    cell: ({ row }) => {
      const articleName = row.original.articleName;
      const articleNumber = row.original.articleNumber;
      return <div className='text-nowrap'>{articleName}</div>;
    },
  },
  {
    accessorKey: 'articleNumber',
    header: dict.cardPositions.columns.articleNumber,
  },

  {
    accessorKey: 'quantity',
    header: dict.cardPositions.columns.quantity,
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
    header: dict.cardPositions.columns.wip,
    cell: ({ row }) => {
      const wip = row.original.wip;
      return wip ? <Check /> : null;
    },
  },
  {
    accessorKey: 'approver',
    header: dict.cardPositions.columns.approved,
  },
  {
    accessorKey: 'comment',
    header: dict.cardPositions.columns.comment,
    cell: ({ row }) => {
      const comment = row.getValue('comment');
      return <div className='w-[300px]'>{comment as React.ReactNode}</div>;
    },
  },
  {
    accessorKey: 'bin',
    header: dict.cardPositions.columns.storageBin,
    cell: ({ row }) => {
      const bin = row.original.bin;
      return <div className='text-nowrap'>{bin && bin.toUpperCase()}</div>;
    },
  },
  {
    accessorKey: 'deliveryDateLocaleString',
    header: dict.cardPositions.columns.deliveryDate,
  },
  {
    accessorKey: 'timeLocaleString',
    header: dict.cardPositions.columns.lastChange,
  },
];
