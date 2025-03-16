'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Check, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  approveOvertimeRequest as approve,
  deleteOvertimeRequestDraft as deleteDraft,
} from '../../actions';
import { OvertimeType } from '../../lib/production-overtime-types';

export const columns: ColumnDef<OvertimeType>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      return (
        <div
          className={cn(
            status === 'pending' && 'animate-pulse font-bold text-red-500',
            status === 'approved' && 'font-bold text-green-500',
            status === 'rejected' && 'font-bold',
            status === 'draft' && 'font-bold text-gray-500',
          )}
        >
          {status === 'pending' && 'Oczekuje'}
          {status === 'approved' && 'Zatwierdzony'}
          {status === 'rejected' && 'Odrzucony'}
          {status === 'draft' && 'Szkic'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Akcje',
    cell: ({ row }) => {
      const { data: session } = useSession();
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
              {request.status === 'draft' && (
                <Link href={`/production-overtime/edit/${request._id}`}>
                  <DropdownMenuItem>
                    <Pencil className='mr-2 h-4 w-4' />
                    <span>Edytuj</span>
                  </DropdownMenuItem>
                </Link>
              )}
              {request.status !== 'draft' && (
                <>
                  <Link href={`/deviations/${request._id}`}>
                    <DropdownMenuItem>
                      <BookOpen className='mr-2 h-4 w-4' />
                      <span>Otwórz</span>
                    </DropdownMenuItem>
                  </Link>
                  {session?.user?.roles?.includes('plant-manager') &&
                    request.status !== 'approved' && (
                      <DropdownMenuItem
                        onClick={() => request._id && approve(request._id)}
                      >
                        <Check className='mr-2 h-4 w-4' />
                        <span>Zatwierdź</span>
                      </DropdownMenuItem>
                    )}
                </>
              )}
              {request.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => request._id && deleteDraft(request._id)}
                  className='focus:bg-red-400 dark:focus:bg-red-700'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  <span>Usuń</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
  {
    accessorKey: 'approved',
    header: 'Zatwierdzony',
    cell: ({ row }) => {
      const approvedAtLocaleString = row.original.approvedAtLocaleString;
      return (
        <div>{approvedAtLocaleString ? `${approvedAtLocaleString}` : '-'}</div>
      );
    },
  },
  {
    accessorKey: 'fromLocaleString',
    header: 'Od',
  },
  {
    accessorKey: 'toLocaleString',
    header: 'Do',
  },
  {
    accessorKey: 'employees',
    header: 'Pracownicy',
    cell: ({ row }) => {
      const employees = row.getValue('employees');
      return <div>{Array.isArray(employees) ? employees.length : 0}</div>;
    },
  },
  {
    accessorKey: 'reason',
    header: 'Uzasadnienie',
    cell: ({ row }) => {
      const reason = row.getValue('reason');
      return <div className='w-[250px] text-justify'>{reason as string}</div>;
    },
  },
  {
    accessorKey: 'note',
    header: 'Dod. info.',
    cell: ({ row }) => {
      const note = row.getValue('note');
      return <div className='w-[250px] text-justify'>{note as string}</div>;
    },
  },
  {
    accessorKey: 'requestedAtLocaleString',
    header: 'Zlecenie wystawione',
  },
  {
    accessorKey: 'requestedBy',
    header: 'Wystawił',
    cell: ({ row }) => {
      const requestedBy = row.getValue('requestedBy');
      return (
        <div className='whitespace-nowrap'>
          {extractNameFromEmail(requestedBy as string)}
        </div>
      );
    },
  },

  {
    accessorKey: 'editedAtLocaleString',
    header: 'Ostatnia zmiana',
  },
];
