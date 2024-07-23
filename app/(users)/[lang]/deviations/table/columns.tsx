'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Trash2, History, Pencil } from 'lucide-react';
import { deleteDraftDeviation } from '../actions';
import { DeviationType } from '@/lib/types/deviation';
import { toast } from 'sonner';
import { ObjectId } from 'mongodb';

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
            <span className='italic text-orange-500'>
              W trakcie zatwierdzania
            </span>
          );
          break;
        case 'valid':
          statusLabel = (
            <span className='font-bold text-green-600'>Obowiązuje</span>
          );
          break;
        case 'closed':
          statusLabel = <span className=''>Zamknięte</span>;
          break;
        case 'rejected':
          statusLabel = <span className='text-red-600'>Odrzucone</span>;
          break;
        case 'draft':
          statusLabel = (
            <span className='font-extralight italic tracking-widest text-gray-600'>
              Szkic
            </span>
          );
          break;
        default:
          statusLabel = <span className='text-gray-600'>Nieznany</span>;
          break;
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
              <Link href={`/deviations/edit/${deviation.articleNumber}`}>
                <DropdownMenuItem>
                  <Pencil className='mr-2 h-4 w-4' />
                  <span>Edytuj</span>
                </DropdownMenuItem>
              </Link>
            )}
            {deviation.status !== 'draft' && (
              <Link href={`/deviations/history/${deviation.articleNumber}`}>
                <DropdownMenuItem>
                  <History className='mr-2 h-4 w-4' />
                  <span>Historia</span>
                </DropdownMenuItem>
              </Link>
            )}
            {deviation.status !== 'draft' && (
              <DropdownMenuItem
                onClick={() => handleCopyId(deviation._id)}
                // className=' focus:bg-red-400 dark:focus:bg-red-700'
              >
                <Copy className='mr-2 h-4 w-4' />
                <span>Kopiuj ID</span>
              </DropdownMenuItem>
            )}
            {deviation.status === 'draft' && (
              <DropdownMenuItem
                onClick={() =>
                  deviation._id && deleteDraftDeviation(deviation._id)
                }
                className=' focus:bg-red-400 dark:focus:bg-red-700'
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
    accessorKey: 'drawingNumber',
    header: 'Rysunek',
  },
  {
    accessorKey: 'quantity',
    header: 'Ilość',
  },
  {
    accessorKey: 'charge',
    header: 'Partia',
  },
  {
    accessorKey: 'reason',
    header: 'Powód',
  },
  {
    accessorKey: 'timePeriod.from',
    header: 'Od',
  },
  {
    accessorKey: 'timePeriod.to',
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
