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
import { toast } from 'sonner';
import { approveOvertimeRequest as approve } from '../../../actions';
import { overtimeRequestEmployeeType } from '../../../lib/production-overtime-types';

const handleApprove = async (id: string) => {
  toast.promise(
    approve(id).then((res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      return res;
    }),
    {
      loading: 'Zapisuję zmiany...',
      success: 'Zlecenie zatwierdzone!',
      error: (error) => {
        const errorMsg = error.message;
        if (errorMsg === 'unauthorized') return 'Nie masz uprawnień!';
        if (errorMsg === 'not found') return 'Nie znaleziono zlecenia!';
        console.error('handleApprove', errorMsg);
        return 'Skontaktuj się z IT!';
      },
    },
  );
};

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
      const request = row.original;
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <Link href={`/production-overtime/edit/${request._id}`}>
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
