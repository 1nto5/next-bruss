'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Copy, MoreHorizontal } from 'lucide-react';

import { DeviationType } from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash2 } from 'lucide-react';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteDraftDeviation } from '../../actions';

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
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let statusLabel;

      switch (status) {
        case 'approval':
          statusLabel = (
            <span className='rounded-md bg-orange-100 px-2 py-1 italic dark:bg-orange-600'>
              W trakcie zatwierdzania
            </span>
          );
          break;
        case 'valid':
          statusLabel = (
            <span className='rounded-md bg-green-100 px-2 py-1 font-bold dark:bg-green-600'>
              Obowiązuje
            </span>
          );
          break;
        case 'closed':
          statusLabel = (
            <span className='rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-600'>
              Zamknięte
            </span>
          );
          break;
        case 'rejected':
          statusLabel = (
            <span className='rounded-md bg-red-100 px-2 py-1 dark:bg-red-600'>
              Odrzucone
            </span>
          );
          break;
        case 'to approve':
          statusLabel = (
            <span className='rounded-md bg-yellow-100 px-2 py-1 dark:bg-yellow-600'>
              Do zatwierdzenia
            </span>
          );
          break;
        case 'draft':
          statusLabel = (
            <span className='rounded-md bg-gray-100 px-2 py-1 font-extralight tracking-widest italic dark:bg-gray-600'>
              Szkic
            </span>
          );
          break;
        default:
          statusLabel = <span>{status}</span>;
      }

      return statusLabel;
    },
  },
  {
    id: 'actions',
    header: 'Akcje',
    cell: ({ row }) => {
      const deviation = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {/* <DropdownMenuLabel>
              ...{deviation._id?.toString().slice(-5)}
            </DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator /> */}
            {deviation.status === 'draft' && (
              <Link href={`/deviations/edit/${deviation._id}`}>
                <DropdownMenuItem>
                  <Pencil className='mr-2 h-4 w-4' />
                  <span>Edytuj</span>
                </DropdownMenuItem>
              </Link>
            )}
            {/* {deviation.status !== 'draft' && (
              <Link href={`/deviations/history/${deviation.articleNumber}`}>
                <DropdownMenuItem>
                  <History className='mr-2 h-4 w-4' />
                  <span>Historia</span>
                </DropdownMenuItem>
              </Link>
            )} */}
            {deviation.status !== 'draft' && (
              <>
                <Link href={`/deviations/${deviation._id}`}>
                  <DropdownMenuItem>
                    <Pencil className='mr-2 h-4 w-4' />
                    <span>Otwórz</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onClick={() => handleCopyId(deviation._id)}
                  // className=' focus:bg-red-400 dark:focus:bg-red-700'
                >
                  <Copy className='mr-2 h-4 w-4' />
                  <span>Kopiuj ID</span>
                </DropdownMenuItem>
              </>
            )}
            {deviation.status === 'draft' && (
              <DropdownMenuItem
                onClick={() =>
                  deviation._id && deleteDraftDeviation(`${deviation._id}`)
                }
                className='focus:bg-red-400 dark:focus:bg-red-700'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                <span>Usuń</span>
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

  {
    accessorKey: 'articleNumber',
    header: 'Numer',
  },
  {
    accessorKey: 'articleName',
    header: 'Nazwa',
  },
  {
    accessorKey: 'quantity.value',
    header: 'Ilość',
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const value = quantity?.value;
      const unit = quantity?.unit;

      return (
        <span className='text-nowrap'>
          {value} {unit && ` ${unit === 'pcs' ? 'szt.' : unit}`}
        </span>
      );
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
