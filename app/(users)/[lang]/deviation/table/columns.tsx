'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

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
import { deleteCapa } from '.././actions';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Capa = {
  deviationId: string;
  client: string;
  line: string;
  articleNumber: string;
  articleName: string;
  clientPartNumber: string;
  piff: string;
  processDescription: string;
  rep160t?: string;
  rep260t?: string;
  rep260t2k?: string;
  rep300t?: string;
  rep300t2k?: string;
  rep400t?: string;
  rep500t?: string;
  b50?: string;
  b85?: string;
  engel?: string;
  eol?: string;
  cutter?: string;
  other?: string;
  soldCapa?: string;
  flex?: string;
  possibleMax?: string;
  comment?: string;
  sop?: string;
  eop?: string;
  service?: string;
  edited?: { date: string; email: string };
};

export const columns: ColumnDef<Capa>[] = [
  {
    accessorKey: 'deviationId',
    header: 'ID',
  },
  {
    accessorKey: 'client',
    header: 'Klient',
  },
  {
    accessorKey: 'line',
    header: 'Linia',
  },
  {
    accessorKey: 'articleNumber',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Artykuł
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'articleName',
    header: 'Nazwa art.',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const capa = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{capa.articleNumber}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/capa/edit/${capa.articleNumber}`}>
              <DropdownMenuItem>
                <Pencil className='mr-2 h-4 w-4' />
                <span>Edytuj</span>
              </DropdownMenuItem>
            </Link>
            <Link href={`/capa/history/${capa.articleNumber}`}>
              <DropdownMenuItem>
                <History className='mr-2 h-4 w-4' />
                <span>Historia</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => deleteCapa(capa.articleNumber)}
              className=' focus:bg-red-400 dark:focus:bg-red-700'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              <span>Usuń</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: 'edited.date',
    header: 'Ostatnia edycja',
  },
  {
    accessorKey: 'edited.name',
    header: 'Edytowane przez',
  },
];
