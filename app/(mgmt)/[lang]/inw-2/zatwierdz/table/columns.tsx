'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ClipboardCheck, Copy, MoreHorizontal, Table } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeviationType } from '@/lib/types/deviation';
import { Pencil, Trash2 } from 'lucide-react';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteDraftDeviation } from '../actions';

const handleCopyId = async (id: ObjectId | undefined) => {
  if (id) {
    try {
      await navigator.clipboard.writeText(id.toString());
      toast.success('ID skopiowane!');
    } catch (error) {
      toast.error('Nie udało się skopiować ID');
    }
  } else {
    toast.error('Skontaktuj się z IT!');
  }
};

export const columns: ColumnDef<DeviationType>[] = [
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

  {
    accessorKey: 'number',
    header: 'Numer',
  },
  {
    id: 'actions',
    header: 'Pozycja na karcie',
    cell: ({ row }) => {
      const cardId = row.original._id;
      return (
        <Link href={`inw-2/zatwierdz/${cardId}`}>
          <Button size='icon' type='button' variant='outline'>
            <Table />
          </Button>
        </Link>
      );
    },
  },
  {
    accessorKey: 'articleName',
    header: 'Nazwa',
  },
  {
    accessorKey: 'creators',
    header: 'Spisujący',
    cell: ({ row }) => {
      const creators = row.original;

      return <span className='text-nowrap'></span>;
    },
  },
  {
    accessorKey: 'reason',
    header: 'Powód',
  },
  {
    accessorKey: 'timePeriodLocalDateString.from',
    header: 'Od',
  },
  {
    accessorKey: 'timePeriodLocalDateString.to',
    header: 'Do',
  },
  {
    accessorKey: '_id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.original._id?.toString();

      return id ? id.toUpperCase() : 'Brak';
    },
  },
];
