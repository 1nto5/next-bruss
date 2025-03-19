'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Replace } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { overtimeRequestEmployeeType } from '../../../lib/production-overtime-types';
const pathname = usePathname();

export const columns: ColumnDef<overtimeRequestEmployeeType>[] = [
  {
    accessorKey: 'firstName',
    header: 'Imie',
  },
  {
    accessorKey: 'lastName',
    header: 'Nazwisko',
  },
  {
    id: 'actions',
    header: 'Akcje',
    cell: ({ row }) => {
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <Link href={`${pathname}/replace/${row.index}`}>
                <DropdownMenuItem>
                  <Replace className='mr-2 h-4 w-4' />
                  <span>Wymień</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
  {
    accessorKey: 'agreedReceivingAtLocaleString',
    header: 'Ustalona data odbioru',
  },
  {
    accessorKey: 'note',
    header: 'Notatka',
  },
];
