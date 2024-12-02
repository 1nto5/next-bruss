'use client';

import { Button } from '@/components/ui/button';
import { CardType } from '@/lib/types/inventory';
import { ColumnDef } from '@tanstack/react-table';
import { Table } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<CardType>[] = [
  // {
  //   accessorKey: 'status',
  //   header: 'Status',
  //   cell: ({ row }) => {
  //     const status = row.original.status;
  //     let statusLabel;

  //     switch (status) {
  //       case 'approval':
  //         statusLabel = (
  //           <span className='rounded-md bg-orange-100 px-2 py-1 italic dark:bg-orange-600'>
  //             W trakcie zatwierdzania
  //           </span>
  //         );
  //         break;
  //       case 'valid':
  //         statusLabel = (
  //           <span className='rounded-md bg-green-100 px-2 py-1 font-bold dark:bg-green-600'>
  //             Obowiązuje
  //           </span>
  //         );
  //         break;
  //       case 'closed':
  //         statusLabel = (
  //           <span className='rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-600'>
  //             Zamknięte
  //           </span>
  //         );
  //         break;
  //       case 'rejected':
  //         statusLabel = (
  //           <span className='rounded-md bg-red-100 px-2 py-1 dark:bg-red-600'>
  //             Odrzucone
  //           </span>
  //         );
  //         break;
  //       case 'to approve':
  //         statusLabel = (
  //           <span className='rounded-md bg-yellow-100 px-2 py-1 dark:bg-yellow-600'>
  //             Do zatwierdzenia
  //           </span>
  //         );
  //         break;
  //       case 'draft':
  //         statusLabel = (
  //           <span className='rounded-md bg-gray-100 px-2 py-1 font-extralight italic tracking-widest dark:bg-gray-600'>
  //             Szkic
  //           </span>
  //         );
  //         break;
  //       default:
  //         statusLabel = <span>{status}</span>;
  //     }

  //     return statusLabel;
  //   },
  // },

  // {
  //   accessorKey: 'number',
  //   header: 'Numer',
  // },
  // {
  //   id: 'actions',
  //   header: 'Pozycja na karcie',
  //   cell: ({ row }) => {
  //     const cardNumber = row.original.number;
  //     return (
  //       <Link href={`/inw-2/zatwierdz/${cardNumber}`}>
  //         <Button size='icon' type='button' variant='outline'>
  //           <Table />
  //         </Button>
  //       </Link>
  //     );
  //   },
  // },
  {
    accessorKey: 'creators',
    header: 'Spisujący',
    cell: ({ row }) => {
      const creators = row.original.creators;
      return <span className='text-nowrap'>{creators.join(', ')}</span>;
    },
  },
  {
    accessorKey: 'positions',
    header: 'Pozycje',
    cell: ({ row }) => {
      const positions = row.original.positions;
      return <span>{(positions && positions.length) || 0}</span>;
    },
  },
  {
    id: 'approvedPositions',
    accessorKey: 'positions',
    header: 'Pozycje zatwierdzone',
    cell: ({ row }) => {
      const positions = row.original.positions;
      const approvedCount = positions
        ? positions.filter((pos) => pos.approver).length
        : 0;
      return <span>{approvedCount}</span>;
    },
  },
  {
    accessorKey: 'warehouse',
    header: 'Magazyn',
  },
  {
    accessorKey: 'sector',
    header: 'Sektor',
  },
];
