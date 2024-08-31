'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Copy, MoreHorizontal } from 'lucide-react';

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
// import { deleteDraftDeviation } from '../actions';

type DmcScansType = {
  dmc: string;
  time: string;
}[];

export const columns: ColumnDef<DmcScansType>[] = [
  {
    accessorKey: 'dmc',
    header: 'DMC',
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
          {/* <DropdownMenuContent align='end'>
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
           
          </DropdownMenuContent> */}
        </DropdownMenu>
      );
    },
  },
];
